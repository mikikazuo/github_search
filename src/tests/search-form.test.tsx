import { ClientRepositoryList } from "@/components/client-repository-list";
import { GitHubRepository, searchRepositories } from "@/lib/github";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// モックの設定
jest.mock("@/lib/github", () => ({
  searchRepositories: jest.fn(),
}));

// RepositoryCardコンポーネントのモック
jest.mock("@/components/repository-card", () => ({
  RepositoryCard: ({ repository }: { repository: GitHubRepository }) => (
    <div data-testid={`repository-card-${repository.id}`}>
      {repository.full_name}
    </div>
  ),
}));

describe("ClientRepositoryList Component", () => {
  // テスト前の初期化
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockInitialItems = [
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
  ];

  it("初期状態で「もっと読み込む」ボタンが表示される", () => {
    render(
      <ClientRepositoryList
        initialQuery=""
        initialTotalCount={100}
        initialItems={mockInitialItems}
      />
    );

    // 「もっと読み込む」ボタンが表示されていることを確認
    expect(screen.getByText("もっと読み込む")).toBeInTheDocument();
  });

  it("初期アイテム数と同じ場合、「もっと読み込む」ボタンが表示されない", () => {
    render(
      <ClientRepositoryList
        initialQuery=""
        initialTotalCount={1} // 初期アイテムと同じ数
        initialItems={mockInitialItems}
      />
    );

    // 「もっと読み込む」ボタンが表示されていないことを確認
    expect(screen.queryByText("もっと読み込む")).not.toBeInTheDocument();
  });

  it("「もっと読み込む」をクリックすると追加データを読み込む", async () => {
    // 追加データのモック
    const mockAdditionalItems = [
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
    ];

    (searchRepositories as jest.Mock).mockResolvedValue({
      total_count: 100,
      incomplete_results: false,
      items: mockAdditionalItems,
    });

    render(
      <ClientRepositoryList
        initialQuery="test"
        initialTotalCount={100}
        initialItems={mockInitialItems}
      />
    );

    // 「もっと読み込む」ボタンをクリック
    fireEvent.click(screen.getByText("もっと読み込む"));

    // ローディング表示の確認
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();

    // API呼び出しの確認
    expect(searchRepositories).toHaveBeenCalledWith("test", 2);

    // 追加データの読み込み完了を待つ
    await waitFor(() => {
      expect(screen.getByTestId("repository-card-2")).toBeInTheDocument();
    });

    // 追加されたリポジトリが表示されていることを確認
    expect(screen.getByText("owner/repo2")).toBeInTheDocument();
  });

  it("エラーが発生した場合、エラーメッセージを表示する", async () => {
    // APIエラーのモック
    (searchRepositories as jest.Mock).mockRejectedValue(new Error("API error"));

    render(
      <ClientRepositoryList
        initialQuery="test"
        initialTotalCount={100}
        initialItems={mockInitialItems}
      />
    );

    // 「もっと読み込む」ボタンをクリック
    fireEvent.click(screen.getByText("もっと読み込む"));

    // エラーメッセージの表示を待つ
    await waitFor(() => {
      expect(screen.getByText(/エラー: API error/)).toBeInTheDocument();
    });
  });

  it("全てのデータを読み込んだ場合、「もっと読み込む」ボタンが消える", async () => {
    // 最後のデータを返すようにモック
    (searchRepositories as jest.Mock).mockResolvedValue({
      total_count: 2,
      incomplete_results: false,
      items: [
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
    });

    render(
      <ClientRepositoryList
        initialQuery="test"
        initialTotalCount={2} // 合計2件のみ
        initialItems={mockInitialItems}
      />
    );

    // 最初は「もっと読み込む」ボタンが表示される
    expect(screen.getByText("もっと読み込む")).toBeInTheDocument();

    // 「もっと読み込む」ボタンをクリック
    fireEvent.click(screen.getByText("もっと読み込む"));

    // 追加データの読み込み完了を待つ
    await waitFor(() => {
      expect(screen.getByTestId("repository-card-2")).toBeInTheDocument();
    });

    // すべてのデータを読み込んだので、「もっと読み込む」ボタンが消えていることを確認
    expect(screen.queryByText("もっと読み込む")).not.toBeInTheDocument();
  });
});
