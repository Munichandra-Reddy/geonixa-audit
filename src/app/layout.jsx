import '../index.css';
import { AppProvider } from '../context/AppContext';
import AuthGuard from '../components/AuthGuard';

export const metadata = {
  title: 'Geonixa Audit',
  description: 'Geonixa Audit Dashboard',
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
