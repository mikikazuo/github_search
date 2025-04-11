import Home from "@/app/page";
import { ClientRepositoryListProps } from "@/components/client-repository-list";
import { searchRepositories } from "@/lib/github";
import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";

// モックの設定
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  notFound: jest.fn(),
}));

jest.mock("@/lib/github", () => ({
  searchRepositories: jest.fn(),
}));

// Suspenseのためのモック
jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    Suspense: ({ children }: { children: React.ReactNode }) => children,
  };
});

// ClientRepositoryListコンポーネントのモック
jest.mock("@/components/client-repository-list", () => ({
  ClientRepositoryList: ({
    initialQuery,
    initialTotalCount,
    initialItems,
  }: ClientRepositoryListProps) => (
    <div data-testid="client-repository-list">
      Client Repository List (Query: {initialQuery}, Total: {initialTotalCount},
      Items: {initialItems.length})
    </div>
  ),
}));

// SearchFormコンポーネントのモック
jest.mock("@/components/search-form", () => ({
  SearchForm: ({ initialQuery }: { initialQuery: string }) => (
    <div data-testid="search-form">Search Form (Query: {initialQuery})</div>
  ),
}));

describe("Home Page", () => {
  // セットアップ
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
      toString: jest.fn().mockReturnValue(""),
    });
  });

  it("リポジトリリストが正常に表示される", async () => {
    // GitHub APIの戻り値をモック
    const mockRepositories = {
      total_count: 1000,
      incomplete_results: false,
      items: [
        {
          id: 1,
          name: "repo1",
          full_name: "owner/repo1",
          description: "Repository 1 description",
          html_url: "https://github.com/owner/repo1",
          stargazers_count: 1000,
          watchers_count: 500,
          forks_count: 200,
          open_issues_count: 50,
          language: "TypeScript",
          owner: {
            login: "owner",
            avatar_url: "https://example.com/avatar.png",
          },
        },
        {
          id: 2,
          name: "repo2",
          full_name: "owner/repo2",
          description: "Repository 2 description",
          html_url: "https://github.com/owner/repo2",
          stargazers_count: 2000,
          watchers_count: 1000,
          forks_count: 400,
          open_issues_count: 100,
          language: "JavaScript",
          owner: {
            login: "owner",
            avatar_url: "https://example.com/avatar.png",
          },
        },
      ],
    };

    (searchRepositories as jest.Mock).mockResolvedValue(mockRepositories);

    // コンポーネントをレンダリング
    render(await Home({ searchParams: {} }));

    // 検証
    expect(searchRepositories).toHaveBeenCalledWith("", 1);

    // タイトルがレンダリングされていることを確認
    expect(screen.getByText("GitHub リポジトリ検索")).toBeInTheDocument();

    // 検索結果の件数が表示されていることを確認
    expect(
      screen.getByText(/検索結果: 1,000件のリポジトリが見つかりました/)
    ).toBeInTheDocument();

    // リポジトリカードがレンダリングされていることを確認
    expect(screen.getByText("owner/repo1")).toBeInTheDocument();
    expect(screen.getByText("owner/repo2")).toBeInTheDocument();

    // 検索フォームが表示されていることを確認
    expect(screen.getByTestId("search-form")).toBeInTheDocument();

    // クライアントリポジトリリストが表示されていることを確認
    expect(screen.getByTestId("client-repository-list")).toBeInTheDocument();
  });

  it("検索クエリがある場合、そのクエリでAPIを呼び出す", async () => {
    // 検索クエリをモック
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest
        .fn()
        .mockImplementation((key) => (key === "q" ? "react" : null)),
      toString: jest.fn().mockReturnValue("q=react"),
    });

    // GitHub APIの戻り値をモック
    const mockRepositories = {
      total_count: 500,
      incomplete_results: false,
      items: [
        {
          id: 3,
          name: "react-app",
          full_name: "owner/react-app",
          description: "React application",
          html_url: "https://github.com/owner/react-app",
          stargazers_count: 3000,
          watchers_count: 1500,
          forks_count: 600,
          open_issues_count: 150,
          language: "JavaScript",
          owner: {
            login: "owner",
            avatar_url: "https://example.com/avatar.png",
          },
        },
      ],
    };

    (searchRepositories as jest.Mock).mockResolvedValue(mockRepositories);

    // コンポーネントをレンダリング
    render(await Home({ searchParams: { q: "react" } }));

    // 検証
    expect(searchRepositories).toHaveBeenCalledWith("react", 1);

    // 検索結果の件数が表示されていることを確認
    expect(
      screen.getByText(/検索結果: 500件のリポジトリが見つかりました/)
    ).toBeInTheDocument();

    // 検索結果のリポジトリが表示されていることを確認
    expect(screen.getByText("owner/react-app")).toBeInTheDocument();
  });

  it("検索結果が0件の場合、メッセージを表示する", async () => {
    // GitHub APIの戻り値をモック（0件）
    const mockEmptyRepositories = {
      total_count: 0,
      incomplete_results: false,
      items: [],
    };

    (searchRepositories as jest.Mock).mockResolvedValue(mockEmptyRepositories);

    // コンポーネントをレンダリング
    render(await Home({ searchParams: { q: "nonexistentrepo123456789" } }));

    // 検証
    expect(searchRepositories).toHaveBeenCalledWith(
      "nonexistentrepo123456789",
      1
    );

    // 検索結果の件数が表示されていることを確認
    expect(
      screen.getByText(/検索結果: 0件のリポジトリが見つかりました/)
    ).toBeInTheDocument();

    // 結果がない場合のメッセージが表示されていることを確認
    expect(
      screen.getByText(
        "リポジトリが見つかりませんでした。検索条件を変更してお試しください。"
      )
    ).toBeInTheDocument();
  });
});
