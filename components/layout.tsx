import styles from './layout.module.css';
import { Providers } from '../app/providers';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className={styles.container}>
        <main>{children}</main>
      </div>
    </Providers>
  );
}
