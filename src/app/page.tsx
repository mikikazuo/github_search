import { Metadata } from "next";

/**
 * ページのメタデータ
 */
export const metadata: Metadata = {
  title: "GitHub リポジトリ検索 | リポジトリエクスプローラー",
  description:
    "GitHub APIを使用してリポジトリを検索・閲覧できるアプリケーション",
};

/**
 * リポジトリ一覧・検索ページ
 */
// export default function HomePage() {
//   return <RepositoryList />;
// }

import { ClientRepositoryList } from "@/components/client-repository-list";
import { RepositoryCard } from "@/components/repository-card";
import { SearchForm } from "@/components/search-form";
import { GitHubSearchResponse, searchRepositories } from "@/lib/github";
import { Suspense } from "react";

// 検索パラメータの型
// interface SearchParams {
//   q?: string;
// }
type Params = Promise<{ q?: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// サーバーコンポーネントのルートページ
export default async function Home(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  // URLパラメータから検索キーワードを取得（なければ空文字）
  const query = params.q || "";

  let initialData: GitHubSearchResponse;
  try {
    // サーバーサイドでAPIを呼び出して初期データを取得
    initialData = await searchRepositories(query, 1);
  } catch {
    return (
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          GitHub リポジトリ検索
        </h1>
        {/* 検索フォーム - クライアントコンポーネント */}
        <div className="max-w-xl mx-auto">
          <SearchForm initialQuery={query} />
        </div>
        <p className="mt-10 text-muted-foreground mb-4">
          読み込みに失敗しました。しばらくしてから再度お試しください。
        </p>
      </main>
    );
  }
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        GitHub リポジトリ検索
      </h1>

      {/* 検索フォーム - クライアントコンポーネント */}
      <div className="max-w-xl mx-auto">
        <SearchForm initialQuery={query} />
      </div>

      <div className="mt-8">
        {/* 検索結果のサマリー */}
        <p className="text-muted-foreground mb-4">
          検索結果: {initialData.total_count.toLocaleString()}
          件のリポジトリが見つかりました
        </p>

        {/* 初期リポジトリリスト（サーバーレンダリング） */}
        {initialData.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialData.items.map((repo) => (
              <RepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-muted rounded-lg">
            <p>
              リポジトリが見つかりませんでした。検索条件を変更してお試しください。
            </p>
          </div>
        )}

        {/* クライアントコンポーネントでさらに読み込むUI */}
        <Suspense
          fallback={<div className="mt-8 text-center">読み込み中...</div>}
        >
          <ClientRepositoryList
            initialQuery={query}
            initialTotalCount={initialData.total_count}
            initialItems={initialData.items}
          />
        </Suspense>
      </div>
    </main>
  );
}
