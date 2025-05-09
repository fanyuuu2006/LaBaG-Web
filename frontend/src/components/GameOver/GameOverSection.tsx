"use client";
import { useNowMode } from "@/context/NowModeContext";
import { Button, Space } from "antd";
import { DownloadButton } from "fanyucomponents";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { Game } from "@/utils/game";
import { DownloadOutlined } from "@ant-design/icons";

export const GameOverSection = () => {
  const { User } = useUser();
  const router = useRouter();
  const { setNowMode } = useNowMode();
  const [historyScore, setHistoryScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadFile, setDownloadFile] = useState<{
    name: string;
    url: string;
  } | null>(null);
  useEffect(() => {
    // 取得當前日期，格式化為 YYYYMMDD
    const Today = new Date();
    const FormattedDate = Today.toISOString().slice(0, 10).replace(/-/g, ""); // 轉換成 YYYYMMDD

    const fileName = `${Game.Score}_${FormattedDate}.json`;

    const jsonstring = JSON.stringify(Game.AllData, null, 4);
    const blob = new Blob([jsonstring], { type: "application/json" }); //Blob 是 JavaScript 的二進制物件
    const fileUrl = URL.createObjectURL(blob);
    setDownloadFile({
      name: fileName,
      url: fileUrl,
    });
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, []);

  useEffect(() => {
    if (!User) {
      setLoading(false);
      return;
    } // 若沒有 User 則不進行請求
    const fetchHistoryScore = async () => {
      const score = await User.historyScore();
      setHistoryScore(score);
      setLoading(false);
    };
    fetchHistoryScore();
  }, [User]);

  return (
    <section style={{ height: "100%" }}>
      <Space direction="vertical" align="center" size="middle">
        <div
          className="Title"
          style={{
            color: "red",
            filter: "drop-shadow(0px 0px 1px #ff0000)",
          }}
        >
          遊戲結束！
        </div>
        <div
          className="Note"
          style={{
            color: "white",
            display: "flex",
            alignItems: "end",
            gap: "5px",
          }}
        >
          最終分數為:{" "}
          <span className="Content">
            {Game.Score.toString().padStart(8, "\u00A0")}
          </span>
          <span className="Hint" style={{ color: "#FF3333" }}>
            {User && !loading && Game.Score > historyScore && "新紀錄"}
          </span>
        </div>
        <Button
          className="Note"
          style={{
            padding: "1em",
          }}
          type="primary"
          onClick={() => {
            Game.Reset();
            setNowMode(Game.NowMode());
            router.push("./Game");
          }}
        >
          再玩一次
        </Button>
      </Space>
      {downloadFile && (
        <DownloadButton
          fileName={downloadFile.name}
          fileUrl={downloadFile.url}
          className="Hint"
          style={{
            backgroundColor: "#FFFF00 ",
            color: "#000000",
            position: "fixed",
            padding: "0 1em",
            bottom: "1em",
            border: "#878700 solid 2px",
            borderRadius: "5px",
          }}
          icon={<DownloadOutlined />}
        >
          保存本次紀錄檔案
        </DownloadButton>
      )}
    </section>
  );
};
