import { RepositoryCard } from "@/components/repository-card";
import { render, screen } from "@testing-library/react";

// next/imageをモック
// jest.mock("next/image", () => ({
//   __esModule: true,
//   default: (props: any) => {
//     return <img {...props} />;
//   },
// }));

// テスト用のリポジトリデータ
const mockRepository = {
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
    owner: {
        login: "owner",
        avatar_url: "https://example.com/avatar.png",
    },
};

describe("RepositoryCard Component", () => {
    it("リポジトリ情報が正しく表示される", () => {
        render(<RepositoryCard repository={mockRepository} />);

        // リポジトリ名
        expect(screen.getByText("owner/test-repo")).toBeInTheDocument();

        // 説明
        expect(screen.getByText("Test repository description")).toBeInTheDocument();

        // プログラミング言語
        expect(screen.getByText("TypeScript")).toBeInTheDocument();

        // スター数
        expect(screen.getByTitle("1,000 スター")).toBeInTheDocument();
        expect(screen.getByText("★ 1,000")).toBeInTheDocument();

        // フォーク数
        expect(screen.getByTitle("200 フォーク")).toBeInTheDocument();
        expect(screen.getByText("🍴 200")).toBeInTheDocument();

        // アバター画像
        const avatarImg = screen.getByAltText("ownerのアバター");
        expect(avatarImg).toBeInTheDocument();
        //expect(avatarImg).toHaveAttribute("src", "https://example.com/avatar.png");

        // リンク
        const link = screen.getByTestId("repository-card-link");
        expect(link).toHaveAttribute("href", "/repository/owner%2Ftest-repo");
    });

    it("説明がない場合は「説明なし」と表示される", () => {
        const repoWithoutDesc = { ...mockRepository, description: null };
        render(<RepositoryCard repository={repoWithoutDesc} />);

        expect(screen.getByText("説明なし")).toBeInTheDocument();
    });

    it("言語がない場合は言語バッジが表示されない", () => {
        const repoWithoutLang = { ...mockRepository, language: null };
        render(<RepositoryCard repository={repoWithoutLang} />);

        expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
    });

    it("大きな数値が正しくフォーマットされる", () => {
        const repoWithLargeNumbers = {
            ...mockRepository,
            stargazers_count: 1234567,
            forks_count: 9876543,
        };
        render(<RepositoryCard repository={repoWithLargeNumbers} />);

        expect(screen.getByTitle("1,234,567 スター")).toBeInTheDocument();
        expect(screen.getByText("★ 1,234,567")).toBeInTheDocument();

        expect(screen.getByTitle("9,876,543 フォーク")).toBeInTheDocument();
        expect(screen.getByText("🍴 9,876,543")).toBeInTheDocument();
    });
});
