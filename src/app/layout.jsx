import '../index.css';
import { AppProvider } from '../context/AppContext';
import AuthGuard from '../components/AuthGuard';

export const viewport = {
  themeColor: '#064E3B',
};

export const metadata = {
  title: 'Geonixa Audit',
  description: 'Geonixa Audit Dashboard',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Geonixa Audit',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AppProvider>
      </body>
    </html>
  );
}
