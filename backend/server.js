import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "DuckTrack backend is running." });
});

app.get("/api/event-detail", (req, res) => {
  res.json({
    title: "블루밍 스테이지 팬 페스타 2026",
    trust: "공식",
    summary: "이벤트 상세 요약 예시 응답입니다."
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
