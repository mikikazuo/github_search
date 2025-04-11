"use client";

import { RepositoryCard } from "@/components/repository-card";
import { Button } from "@/components/ui/button";
import { GitHubRepository, searchRepositories } from "@/lib/github";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export interface ClientRepositoryListProps {
  initialQuery: string;
  initialTotalCount: number;
  initialItems: GitHubRepository[];
}

/**
 * クライアント側のリポジトリリスト（追加読み込み機能）
 */
export function ClientRepositoryList({
  initialQuery,
  initialTotalCount,
  initialItems,
}: ClientRepositoryListProps) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [page, setPage] = useState(2); // 初期ページはサーバーで取得済みなので2から開始
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(
    initialTotalCount > initialItems.length
  );

  // 初期データが変更されたら状態をリセット
  useEffect(() => {
    // サーバーから渡された初期アイテムは使わない（既に描画されているため）
    setRepositories([]);
    setPage(2);
    setError(null);
    setHasMore(initialTotalCount > initialItems.length);
  }, [initialQuery, initialTotalCount, initialItems]);

  // 追加データを読み込む
  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const data = await searchRepositories(initialQuery, page);

      setRepositories((prev) => [...prev, ...data.items]);
      setPage((prev) => prev + 1);
      setHasMore(
        data.items.length > 0 &&
          initialItems.length + repositories.length + data.items.length <
            data.total_count
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "読み込み中にエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  // 追加読み込みしたリポジトリがない場合は何も表示しない
  if (repositories.length === 0 && !loading && !error && !hasMore) {
    return null;
  }

  return (
    <div className="mt-8">
      {/* エラー表示 */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
          <p>エラー: {error}</p>
        </div>
      )}

      {/* 追加読み込みしたリポジトリ一覧 */}
      {repositories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {repositories.map((repo) => (
            <RepositoryCard key={repo.id} repository={repo} />
          ))}
        </div>
      )}

      {/* もっと読み込むボタン */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                読み込み中...
              </>
            ) : (
              "もっと読み込む"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
