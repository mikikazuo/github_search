import RepositoryDetailPage from "@/app/repository/[fullName]/page";
import { getRepositoryDetail } from "@/lib/github";
import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";

// モックの設定
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("@/lib/github", () => ({
  getRepositoryDetail: jest.fn(),
}));

// next/imageをモック
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

// 詳細テスト用のリポジトリデータ
const mockRepositoryDetail = {
  id: 1,
  name: "test-repo",
  full_name: "owner/test-repo",
  description: "Test repository description",
  html_url: "https://github.com/owner/test-repo",
  stargazers_count: 1000,
  watchers_count: 500,
  forks_count: 200,
  open_issues_count: 50,
  language: "TypeScript",
  topics: ["react", "typescript", "next"],
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-06-01T00:00:00Z",
  pushed_at: "2023-06-15T00:00:00Z",
  size: 5000,
  license: {
    key: "mit",
    name: "MIT License",
    url: "https://api.github.com/licenses/mit",
  },
  owner: {
    login: "owner",
    avatar_url: "https://example.com/avatar.png",
  },
};

describe("RepositoryDetailPage", () => {
  // 各テスト前にモックをクリア
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("リポジトリの詳細情報が正しく表示される", async () => {
    // GitHub APIのモック
    (getRepositoryDetail as jest.Mock).mockResolvedValue(mockRepositoryDetail);

    // コンポーネントをレンダリング
    render(
      await RepositoryDetailPage({ params: { fullName: "owner%2Ftest-repo" } })
    );

    // リポジトリ名
    expect(screen.getByText("test-repo")).toBeInTheDocument();
    expect(screen.getByText("owner/test-repo")).toBeInTheDocument();

    // 説明
    expect(screen.getByText("Test repository description")).toBeInTheDocument();

    // 統計情報
    expect(screen.getByText("1,000")).toBeInTheDocument(); // スター数
    expect(screen.getByText("500")).toBeInTheDocument(); // ウォッチャー数
    expect(screen.getByText("200")).toBeInTheDocument(); // フォーク数
    expect(screen.getByText("50")).toBeInTheDocument(); // Issue数

    // 言語
    expect(screen.getByText("TypeScript")).toBeInTheDocument();

    // 日付情報（フォーマット後の日付文字列）
    expect(screen.getByText("2023年1月1日")).toBeInTheDocument(); // 作成日
    expect(screen.getByText("2023年6月1日")).toBeInTheDocument(); // 更新日
    expect(screen.getByText("2023年6月15日")).toBeInTheDocument(); // プッシュ日

    // トピック
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("next")).toBeInTheDocument();

    // ライセンス
    expect(screen.getByText("MIT License")).toBeInTheDocument();

    // オーナー情報
    expect(screen.getByText("owner")).toBeInTheDocument();

    // 「戻る」ボタン
    expect(screen.getByText("← 検索結果に戻る")).toBeInTheDocument();
  });

  it("リポジトリが見つからない場合、notFound()を呼び出す", async () => {
    // GitHub APIのモック（404エラー）
    const error = new Error("GitHub API Error: 404 Not Found");
    (getRepositoryDetail as jest.Mock).mockRejectedValue(error);

    // コンポーネントをレンダリング
    await RepositoryDetailPage({ params: { fullName: "nonexistent%2Frepo" } });

    // notFound()が呼び出されていることを確認
    expect(notFound).toHaveBeenCalled();
  });
});
