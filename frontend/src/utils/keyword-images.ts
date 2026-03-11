import keywordAespaImage from "../assets/keyword-aespa.jpg";
import keywordInfiniteImage from "../assets/keyword-infinite.jpg";
import keywordIveImage from "../assets/keyword-ive.jpg";
import keywordLesserafimImage from "../assets/keyword-lesserafim.jpg";
import keywordVixxImage from "../assets/keyword-vixx.jpg";

const KEYWORD_IMAGE_MAP: Record<string, string> = {
  아이브: keywordIveImage,
  빅스: keywordVixxImage,
  르세라핌: keywordLesserafimImage,
  인피니트: keywordInfiniteImage,
  에스파: keywordAespaImage,
  블루아카:
    "https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Blue_Archives_cover.jpeg/330px-Blue_Archives_cover.jpeg",
  원신:
    "https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Genshin_Impact_logo.svg/330px-Genshin_Impact_logo.svg.png",
  붕괴스타레일:
    "https://upload.wikimedia.org/wikipedia/en/thumb/7/7f/Honkai_Star_Rail_%28logo%29.png/330px-Honkai_Star_Rail_%28logo%29.png",
  젠레스존제로:
    "https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/Zenless_Zone_Zero_curved_box_logo.svg/330px-Zenless_Zone_Zero_curved_box_logo.svg.png",
  하츠네미쿠:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Hatsune_miku_logo_v3.svg/330px-Hatsune_miku_logo_v3.svg.png",
  원피스:
    "https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg",
  명탐정코난:
    "https://upload.wikimedia.org/wikipedia/en/3/3f/Case_Closed_Volume_36.png",
  귀멸의칼날:
    "https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg",
  포켓몬:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/330px-International_Pok%C3%A9mon_logo.svg.png"
};

function normalizeKeywordLabel(label: string) {
  return label.replace(/[\s:./-]+/g, "").toLowerCase();
}

export function getKeywordImage(label: string) {
  return KEYWORD_IMAGE_MAP[normalizeKeywordLabel(label)] ?? null;
}
