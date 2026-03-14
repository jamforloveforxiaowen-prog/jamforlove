"""
Jam For Love — 大量寄送 Email 工具
使用 Resend API 發送，支援 CSV 收件人清單

使用方式：
  1. 設定環境變數：export RESEND_API_KEY="re_xxxxxxxx"
  2. 準備收件人 CSV 檔案（欄位：name, email）
  3. 修改下方 EMAIL_CONFIG 的信件內容
  4. 執行：python bulk_email.py recipients.csv
"""

import csv
import os
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import resend


# ===== 在這裡修改信件內容 =====
EMAIL_CONFIG = {
    "from": "Jam For Love <onboarding@resend.dev>",  # 驗證網域後改成你的網域
    "subject": "Jam For Love — 最新消息",
    "html": """
    <h1>Jam For Love</h1>
    <p>您好 {name}，</p>
    <p>這裡放信件內容。</p>
    <br>
    <p>Jam For Love 團隊</p>
    """,
}
# =============================


@dataclass
class Recipient:
    name: str
    email: str


def load_recipients(file_path: str) -> list[Recipient]:
    """從 CSV 檔案載入收件人清單"""
    path = Path(file_path)
    if not path.exists():
        print(f"Error: file not found: {file_path}")
        sys.exit(1)

    recipients = []
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f)

        # 檢查必要欄位
        if reader.fieldnames is None or "email" not in reader.fieldnames:
            print("Error: CSV must contain 'email' column")
            sys.exit(1)

        has_name = "name" in reader.fieldnames

        for row in reader:
            email = row["email"].strip()
            if not email:
                continue
            name = row["name"].strip() if has_name and row.get("name") else ""
            recipients.append(Recipient(name=name, email=email))

    return recipients


def send_emails(recipients: list[Recipient]) -> None:
    """逐封寄送 Email，每封間隔 0.2 秒避免 rate limit"""
    total = len(recipients)
    success = 0
    failed: list[tuple[str, str]] = []

    print(f"\n開始寄送，共 {total} 封\n")

    for i, r in enumerate(recipients, 1):
        html = EMAIL_CONFIG["html"].replace("{name}", r.name or "朋友")

        try:
            resend.Emails.send({
                "from": EMAIL_CONFIG["from"],
                "to": [r.email],
                "subject": EMAIL_CONFIG["subject"],
                "html": html,
            })
            success += 1
            print(f"  [{i}/{total}] OK  → {r.email}")
        except Exception as e:
            failed.append((r.email, str(e)))
            print(f"  [{i}/{total}] FAIL → {r.email} ({e})")

        # 間隔 0.2 秒，Resend 免費方案 rate limit 為 10 req/s
        if i < total:
            time.sleep(0.2)

    # 結果摘要
    print(f"\n完成！成功 {success}/{total} 封")
    if failed:
        print(f"\n失敗清單（{len(failed)} 封）：")
        for email, err in failed:
            print(f"  - {email}: {err}")


def main() -> None:
    # 檢查 API Key
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        print("Error: RESEND_API_KEY not set")
        print("Run: export RESEND_API_KEY='re_xxxxxxxx'")
        sys.exit(1)

    resend.api_key = api_key

    # 檢查參數
    if len(sys.argv) < 2:
        print("Usage: python bulk_email.py <recipients.csv>")
        print("\nCSV format:")
        print("  name,email")
        print('  王小明,ming@example.com')
        sys.exit(1)

    recipients = load_recipients(sys.argv[1])

    if not recipients:
        print("Error: no recipients found in file")
        sys.exit(1)

    if len(recipients) > 500:
        print(f"Warning: {len(recipients)} recipients exceeds 500 limit, truncating")
        recipients = recipients[:500]

    # 確認後再寄
    print(f"準備寄送 {len(recipients)} 封信")
    print(f"寄件者：{EMAIL_CONFIG['from']}")
    print(f"主旨：{EMAIL_CONFIG['subject']}")
    print(f"前 3 位收件人：{', '.join(r.email for r in recipients[:3])}")

    confirm = input("\n確認寄送？(y/N): ").strip().lower()
    if confirm != "y":
        print("已取消")
        sys.exit(0)

    send_emails(recipients)


if __name__ == "__main__":
    main()
