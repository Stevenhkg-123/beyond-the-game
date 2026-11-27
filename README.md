# Beyond the Game｜探索不一樣的運動

這是一個以 HTML、CSS、JavaScript 製作，並透過 Streamlit 顯示的學校專題網站。此版本沿用原有七頁架構和互動功能，擴充至十二項運動，加入運動比較評分、真正可跟着做的入門任務及更多即玩挑戰。

## 安裝及啟動

需使用 Python 3.10 或以上版本。

```bash
python -m pip install -r requirements.txt
streamlit run app.py
```

在終端機開啟本資料夾執行以上指令，再按畫面顯示的本機網址瀏覽。無需帳戶、API 金鑰或前端編譯步驟。

## 網站內容

- 首頁、探索運動、運動介紹、新興運動、開始體驗、討論區、關於／聯絡
- 十二項運動：巧固球、健球、合球、競技疊杯、花式踢沙包、劍玉、圓網球、地板球、極限飛盤、飛盤高爾夫、花式跳繩、硬地滾球
- 每項運動均有簡介、歷史、規則、頁內影片、器材、場地、參與人數、安全事項、新手挑戰及組織資訊
- 每項運動均有節奏感、上手難度、合作程度、趣味程度四項 1–5 分的入門參考評分。這是網站編輯的主觀估計，不是官方或科學量表。訪客亦可在試玩後留下自己的趣味評分，結果只儲存在本機
- 每項運動均有短時間可開始的三步入門任務；六項個人運動有計時器和個人成績紀錄；網頁內有疊杯反應及目標投擲兩個即玩小遊戲
- 即時運動篩選與搜尋、Sport Matcher、小測驗、活動規劃工具、可關閉的探索助手，以及可公開發帖、回覆、支持、搜尋和按運動篩選的討論區
- 學校活動均清楚標示為構思，並非已確定舉辦；其他活動請以體育組織公布為準

## 公開討論區

首次開啟討論區時，程式會在專案內建立 `data/forum.sqlite3`，並加入六篇標明由網站團隊發表的討論引子。帖子、回覆和支持數由伺服器保存。凡可瀏覽同一個 Streamlit 網站的人，都可用暱稱公開發帖及回覆。留在討論區時，按「更新討論」即可載入其他訪客的新內容。請勿填寫真實姓名或私人資料。

使用同一個資料庫檔案重啟程式，討論會保留。主機如會在重新部署時清除檔案，可將環境變數 `BTG_FORUM_DB` 設為持久磁碟上可寫入的 SQLite 檔案路徑。SQLite 配合同一台主機使用。各自解壓並在不同電腦啟動的網站有各自的資料庫；要讓其他人參與，請讓他們瀏覽同一個已對外開放的 Streamlit 網址。

舊版儲在瀏覽器的私人討論不會自動公開。如有舊資料，可在同一瀏覽器以原網站網址開啟討論區，再下載備份。

## 免費公開上線

可使用 [Streamlit Community Cloud](https://share.streamlit.io/) 提供的公開 HTTPS 網址，並用 [Neon 免費方案](https://neon.com/pricing) 儲存討論區資料。

1. 把解壓後的專案檔案放在 GitHub 儲存庫根目錄。請保留 `assets/`、`app.py`、`forum_store.py` 及 `requirements.txt`。可用私人儲存庫，並在 Streamlit 授權連接。
2. 在 Neon 建立專用的免費資料庫專案。從 Connect 畫面複製資料庫連線網址，保留 SSL 設定。
3. 在 Streamlit Community Cloud 建立應用程式，選擇該 GitHub 儲存庫和 `app.py`。在 Advanced settings 的 Secrets 貼上以下設定，並用 Neon 的實際連線網址取代範例值。

   ```toml
   BTG_FORUM_DATABASE_URL = "postgresql://..."
   ```

4. 部署後，在 Streamlit 的分享設定將應用程式設為公開。用兩個獨立瀏覽器開啟同一個 `streamlit.app` 網址，發帖後在另一個瀏覽器按「更新討論」，確認可以看到並回覆。

資料庫會在首次開啟討論區時自動建立資料表及加入六篇起始帖。設定 Neon 連線後，新網站使用該資料庫。原有 SQLite 討論若需保留，應先安排匯入。連線網址包含密碼，請只放在 Secrets。免費主機閒置時可能休眠，訪客可在網頁喚醒網站。兩項服務均受免費用量限制。

## 圖片及影片

照片已放進 `assets/images/`，由 Streamlit 直接提供，毋須依賴圖片網站。新增的 30 張 Wikimedia Commons 照片之作者、授權及來源見 [IMAGE_CREDITS.md](IMAGE_CREDITS.md)。使用者原有的六張照片亦保留於頁內，但 ZIP 未附其來源／授權資料，正式公開前請補上。

每項運動使用一條已核對標題及 YouTube 嵌入端點的影片。播放器在頁內；播放需要網絡。YouTube 仍可能因地區、校園網絡或上載者日後更改設定而限制播放，因此每頁均設有原影片連結作後備。

## 專案檔案

- `app.py`：在 Streamlit iframe 載入網站，並處理討論區請求
- `forum_store.py`：SQLite／PostgreSQL 持久儲存、輸入驗證和網站團隊的起始帖
- `assets/index.html`：頁面結構及導覽
- `assets/style.css`：響應式視覺設計與圖示樣式
- `assets/app.js`：運動資料、頁面、影片與互動功能
- `assets/forum.js`：公開討論區介面
- `assets/images/`：運動照片
- `assets/image_credits.json`、`IMAGE_CREDITS.md`：圖片來源及授權資料
- `requirements.txt`：Python 套件版本

## 注意

內容為入門介紹。正式舉辦活動前，應與老師檢查器材、場地、人手、參與者需要，以及相關體育組織的最新規則。聯絡表單只在畫面預覽意見，不會傳送訊息；小遊戲紀錄、練習成績和活動草案儲存在瀏覽器本機。

## 新增運動的規則來源

- [國際圓網球總會（IRF）規則](https://www.roundnetfederation.org/official-rules)
- [國際地板球總會（IFF）](https://floorball.sport/)及[歷史](https://inside.floorball.sport/our-sport/floorball-history/)
- [世界飛盤總會（WFDF）規則](https://rules.wfdf.sport/)
- [職業飛盤高爾夫協會（PDGA）規則](https://www.pdga.com/rules)及[歷史](https://www.pdga.com/history/)
- [國際跳繩聯合會（IJRU）教育資源](https://ijru.sport/education)
- [World Boccia 規則](https://www.worldboccia.com/about-boccia/rules/)
