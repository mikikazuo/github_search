import { toast } from "sonner";

/**
 * GitHubリポジトリの型定義
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

/**
 * GitHubリポジトリ詳細の型定義
 */
export interface RepositoryDetail extends GitHubRepository {
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
}

/**
 * GitHub APIのレスポンス型
 */
export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

/**
 * GitHubのAPIトークンを取得する（環境変数から）
 */
function getGitHubToken(): string | undefined {
  return process.env.GITHUB_TOKEN;
}

/**
 * GitHubリポジトリを検索する関数
 *
 * @param query 検索キーワード
 * @param page ページ番号（1から開始）
 * @returns 検索結果
 */
export async function searchRepositories(
  query: string,
  page: number = 1
): Promise<GitHubSearchResponse> {
  try {
    // 検索キーワードが空の場合はデフォルト検索
    const searchQuery = query.trim() || "stars:>1000";

    // GitHub APIのURL
    const perPage = 12; // 1ページあたりの結果数
    const apiUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(
      searchQuery
    )}&sort=stars&order=desc&page=${page}&per_page=${perPage}`;

    // ヘッダーの設定
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    // GitHubトークンがあればヘッダーに追加（レート制限緩和のため）
    const token = getGitHubToken();
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    const options: RequestInit = {
      headers,
      next: { revalidate: 3600 },
    };

    const response = await fetch(apiUrl, options);

    if (!response.ok) {
      // エラー時にトーストを表示
      toast.error(
        "読み込みに失敗しました。しばらくしてから再度お試しください。"
      );
      throw new Error(
        `GitHub API Error: ${response.status} ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching repositories:", error);
    throw error;
  }
}

/**
 * リポジトリの詳細情報を取得する関数
 *
 * @param owner リポジトリのオーナー
 * @param repo リポジトリ名
 * @returns リポジトリの詳細情報
 */
export async function getRepositoryDetail(
  owner: string,
  repo: string
): Promise<RepositoryDetail> {
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    // ヘッダーの設定
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    // GitHubトークンがあればヘッダーに追加（レート制限緩和のため）
    const token = getGitHubToken();
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    const response = await fetch(apiUrl, {
      headers,
      next: { revalidate: 3600 }, // 1時間キャッシュ
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API Error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching repository detail:", error);
    throw error;
  }
}
