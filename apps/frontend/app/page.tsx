import Link from "next/link";

export default function Home() {
  return (
    <div className="card">
      <h3>Telegram WebApp mini-CRM</h3>
      <p>Выберите режим работы.</p>
      <div className="row">
        <Link className="btn" href="/webapp">
          WebApp клиента
        </Link>
        <Link className="btn secondary" href="/admin/login">
          Кабинет менеджера
        </Link>
      </div>
    </div>
  );
}
