import json
import requests
import io
import csv
from datetime import datetime, timedelta
from pathlib import Path

import pytz
from apscheduler.schedulers.blocking import BlockingScheduler

# ========== 設定 ==========
SCRIPT_DIR = Path(__file__).parent          # src/script/
SRC_DIR    = SCRIPT_DIR.parent              # src/
JSON_PATH  = SRC_DIR / "json" / "tokyo_pollen_all.json"

TOKYO_CITYCODES = [
    13101, 13102, 13103, 13104, 13105, 13106, 13107, 13108, 13109, 13110,
    13111, 13112, 13113, 13114, 13115, 13116, 13117, 13118, 13119, 13120,
    13121, 13122, 13123, 13201, 13202, 13203, 13204, 13205, 13206, 13207,
    13208, 13209, 13210, 13211, 13212, 13213, 13214, 13215, 13216, 13217,
    13218, 13219, 13220, 13221, 13222, 13223, 13224, 13225, 13226, 13227,
    13228, 13229, 13230, 13303, 13305, 13306, 13307, 13308, 13401, 13402,
    13421,
]

JST = pytz.timezone("Asia/Tokyo")


# ========== メイン処理 ==========
def fetch_and_update():
    now_jst = datetime.now(JST)
    print(f"\n[{now_jst.strftime('%Y-%m-%d %H:%M:%S')} JST] 更新処理を開始します")

    # ========== 1. 既存JSONの最終日時を取得 ==========
    if JSON_PATH.exists() and JSON_PATH.stat().st_size > 0:
        with open(JSON_PATH, encoding="utf-8") as f:
            existing_data = json.load(f)
    else:
        existing_data = []

    if existing_data:
        last_date_str = max(row["date"] for row in existing_data)
        last_date = datetime.fromisoformat(last_date_str)
        start_date = (last_date + timedelta(hours=1)).date()
        print(f"JSONの最終日時: {last_date_str}")
    else:
        # JSONが空なら30日前から取得
        start_date = (now_jst - timedelta(days=30)).date()
        print("既存データなし。30日前からフルフェッチします")

    end_date = now_jst.date()
    print(f"ダウンロード期間: {start_date} ～ {end_date}")

    if start_date > end_date:
        print("すでに最新です。スキップします。")
        return

    # ========== 2. 差分データをAPIから取得 ==========
    start_str = start_date.strftime("%Y%m%d")
    end_str   = end_date.strftime("%Y%m%d")
    new_rows  = []

    for citycode in TOKYO_CITYCODES:
        url = (
            f"https://wxtech.weathernews.com/opendata/v1/pollen"
            f"?citycode={citycode}&start={start_str}&end={end_str}"
        )
        try:
            resp = requests.get(url, timeout=30)
            if not resp.ok:
                print(f"  スキップ (citycode={citycode}, status={resp.status_code})")
                continue

            reader = csv.DictReader(io.StringIO(resp.text))
            for row in reader:
                new_rows.append({
                    "citycode": int(row["citycode"]),
                    "date":     row["date"],
                    "pollen":   int(row["pollen"]),
                })

        except requests.RequestException as e:
            print(f"  エラー (citycode={citycode}): {e}")
            continue

    print(f"新規取得: {len(new_rows)} 件")

    if not new_rows:
        print("新規データなし。JSONの更新をスキップします。")
        return

    # ========== 3. 既存データとマージしてJSON上書き ==========
    # (citycode, date) をキーに辞書化して重複を防ぐ
    merged = {(r["citycode"], r["date"]): r for r in existing_data}
    for row in new_rows:
        merged[(row["citycode"], row["date"])] = row

    merged_list = sorted(merged.values(), key=lambda r: (r["date"], r["citycode"]))

    JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(merged_list, f, ensure_ascii=False, indent=2)

    print(f"JSON上書き完了: 合計 {len(merged_list)} 件 → {JSON_PATH}")


# ========== スケジューラ ==========
if __name__ == "__main__":
    # 起動時に即時実行（初回フェッチ）
    fetch_and_update()

# GitHub Actions で実行のため以下不要
    # 毎日JST 01:00 に実行
    # scheduler = BlockingScheduler(timezone=JST)
    # scheduler.add_job(fetch_and_update, "cron", hour=1, minute=0)
    # print("\nスケジューラ起動: 毎日 JST 01:00 に実行します (Ctrl+C で停止)")

    # try:
    #     scheduler.start()
    # except KeyboardInterrupt:
    #     print("スケジューラを停止しました")
