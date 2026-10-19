import "./globals.css";

/** 網址完全無法對應任何語言時顯示（極少發生） */
export default function GlobalNotFound() {
  return (
    <html lang="zh-Hant-TW">
      <body>
        <div className="wrap not-found">
          <p className="code">404</p>
          <h1>找不到這個頁面 · Page not found</h1>
          <p style={{ marginTop: 24 }}>
            <a className="btn" href="/">FUFU × NUKUNUKU</a>
          </p>
        </div>
      </body>
    </html>
  );
}
