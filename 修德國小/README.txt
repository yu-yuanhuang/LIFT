外部GEXF版網站包
內容：
- index.html
- network.gexf

重要：
1. index.html與network.gexf必須放在同一資料夾。
2. 請用HTTP伺服器開啟，不建議直接雙擊file://。
   可在資料夾執行：python -m http.server 8000
   然後瀏覽器開：http://localhost:8000
3. 這版沿用你最新要求：
   - 左右並列：人員左、標籤左；機構右、標籤右；中間距離加大
   - 環狀並列：同一圓左右半圓；兩側標籤都在左側
