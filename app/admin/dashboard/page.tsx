import { db } from '@/lib/firebase'; // Verifique o caminho
import {
  collection,
  getCountFromServer,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
} from 'firebase/firestore';
import { Users, ShoppingBag, DollarSign, Shirt, Activity } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SalesChart } from './_components/SalesChart'; // Criaremos este componente de cliente separado
import type { Order } from '@/services/orders';

// --- FUNÇÕES DE BUSCA DE DADOS (NO SERVIDOR) ---

async function getDashboardStats() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

  const totalSalesQuery = query(
    collection(db, 'orders'),
    where('createdAt', '>=', sevenDaysAgoTimestamp),
  );

  const [usersSnap, productsSnap, ordersSnap, totalSalesSnap] =
    await Promise.all([
      getCountFromServer(collection(db, 'users')),
      getCountFromServer(collection(db, 'products')),
      getCountFromServer(collection(db, 'orders')),
      getDocs(totalSalesQuery),
    ]);

  const totalSales = totalSalesSnap.docs.reduce(
    (sum, doc) => sum + doc.data().totalPrice,
    0,
  );

  return {
    users: usersSnap.data().count,
    products: productsSnap.data().count,
    orders: ordersSnap.data().count,
    totalSales: totalSales,
  };
}

async function getRecentOrders() {
  const ordersQuery = query(
    collection(db, 'orders'),
    orderBy('createdAt', 'desc'),
    limit(5),
  );
  const snapshot = await getDocs(ordersQuery);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];
}

async function getChartData() {
  const chartData: { date: string; Faturamento: number }[] = [];
  const dateToTotal: { [key: string]: number } = {};
  const today = new Date();

  // Inicializa os últimos 7 dias com faturamento 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    dateToTotal[key] = 0;
  }

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

  const salesQuery = query(
    collection(db, 'orders'),
    where('createdAt', '>=', sevenDaysAgoTimestamp),
  );
  const snapshot = await getDocs(salesQuery);

  snapshot.docs.forEach((doc) => {
    const orderData = doc.data();
    const orderDate = (orderData.createdAt as Timestamp)
      .toDate()
      .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    if (dateToTotal[orderDate] !== undefined) {
      dateToTotal[orderDate] += orderData.totalPrice;
    }
  });

  for (const [date, total] of Object.entries(dateToTotal)) {
    chartData.push({ date, Faturamento: total });
  }

  return chartData;
}

// --- COMPONENTES DE UI ---

function DashboardStatCard({
  title,
  value,
  icon: Icon,
  details,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  details: string;
  href?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{details}</p>
      </CardContent>
    </Card>
  );
}

function RecentOrdersTable({ orders }: { orders: Order[] }) {
  const statusMap: {
    [key: string]: {
      text: string;
      variant: 'default' | 'outline' | 'secondary' | 'destructive';
    };
  } = {
    pago: { text: 'Pago', variant: 'default' },
    pending: { text: 'Pendente', variant: 'secondary' },
    enviado: { text: 'Enviado', variant: 'outline' },
    cancelado: { text: 'Cancelado', variant: 'destructive' },
  };

  return (
    <Card className="col-span-12 lg:col-span-4">
      <CardHeader>
        <CardTitle>Últimos Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/path-to-avatar.png" alt="Avatar" />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {order.customer.firstName[0]}
                        {order.customer.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {order.customer.firstName} {order.customer.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.customer.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusMap[order.status]?.variant || 'secondary'}
                  >
                    {statusMap[order.status]?.text || order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(order.totalPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// --- O DASHBOARD PRINCIPAL (SERVER COMPONENT) ---

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const recentOrders = await getRecentOrders();
  const chartData = await getChartData();

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          title="Faturamento (últimos 7 dias)"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(stats.totalSales)}
          icon={DollarSign}
          details={`${stats.orders} pedidos nesse período`}
        />

        <DashboardStatCard
          title="Total de Pedidos"
          value={`+${stats.orders}`}
          icon={ShoppingBag}
          details="Todos os pedidos registrados"
          href="/admin/pedidos"
        />

        <DashboardStatCard
          title="Total de Clientes"
          value={`+${stats.users}`}
          icon={Users}
          details="Todos os clientes cadastrados"
        />
        <Link href="/admin/produtos">
          <DashboardStatCard
            title="Total de Produtos"
            value={stats.products}
            icon={Shirt}
            details="Produtos ativos na loja"
          />
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-12">
          <CardHeader>
            <CardTitle>Visão Geral do Faturamento</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart data={chartData} />
          </CardContent>
        </Card>
      </div>
      <div>
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </div>
  );
}
