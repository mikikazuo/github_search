"use client";

import { GitHubRepository, searchRepositories } from "@/lib/github";
import { useCallback, useEffect, useRef, useState } from "react";
import { RepositoryCard } from "./repository-card";
import { SearchForm } from "./search-form";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

/**
 * リポジトリリストコンポーネント - GitHub リポジトリの検索と無限スクロール表示を行う
 */
export function RepositoryList() {
    // 状態管理
    const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // 無限スクロール用の監視対象要素
    const observerTarget = useRef<HTMLDivElement>(null);

    /**
     * リポジトリを検索する関数
     * @param searchQuery 検索クエリ
     * @param pageNum ページ番号
     * @param append 結果を追加するか（falseの場合は置き換え）
     */
    const fetchRepositories = useCallback(
        async (searchQuery: string, pageNum: number, append: boolean = false) => {
            try {
                setLoading(true);
                setError(null);

                const result = await searchRepositories(searchQuery, pageNum);

                setTotalCount(result.total_count);

                if (append) {
                    setRepositories((prev) => [...prev, ...result.items]);
                } else {
                    setRepositories(result.items);
                }

                // さらに読み込める結果があるかチェック
                setHasMore(
                    result.items.length > 0 &&
                        repositories.length + result.items.length < result.total_count
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "リポジトリの取得中にエラーが発生しました。"
                );
            } finally {
                setLoading(false);
            }
        },
        [repositories.length]
    );

    /**
     * 検索フォームからの検索実行処理
     */
    const handleSearch = useCallback(
        (searchQuery: string) => {
            setQuery(searchQuery);
            setPage(1);
            setRepositories([]);
            fetchRepositories(searchQuery, 1, false);
        },
        [fetchRepositories]
    );

    /**
     * 次のページを読み込む
     */
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchRepositories(query, nextPage, true);
        }
    }, [loading, hasMore, page, query, fetchRepositories]);

    // 初回マウント時にデフォルト検索を実行
    useEffect(() => {
        fetchRepositories("", 1, false);
    }, [fetchRepositories]);

    // 無限スクロール用のIntersection Observer設定
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, loadMore]);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col items-center mb-8">
                <h1 className="text-3xl font-bold mb-6">GitHub リポジトリ検索</h1>
                <SearchForm
                    onSearch={handleSearch}
                    initialQuery={query}
                    isLoading={loading && page === 1}
                />
                {totalCount > 0 && (
                    <p className="mt-4 text-sm text-muted-foreground">
                        検索結果: {totalCount.toLocaleString()} 件のリポジトリが見つかりました
                    </p>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repositories.map((repo) => (
                    <RepositoryCard key={repo.id} repository={repo} />
                ))}

                {/* 読み込み中のスケルトン表示 */}
                {loading &&
                    page > 1 &&
                    Array(3)
                        .fill(0)
                        .map((_, i) => (
                            <div key={`skeleton-${i}`} className="h-60">
                                <Skeleton className="w-full h-full" />
                            </div>
                        ))}
            </div>

            {/* 結果がない場合のメッセージ */}
            {repositories.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">
                        リポジトリが見つかりませんでした。検索条件を変更してお試しください。
                    </p>
                </div>
            )}

            {/* 無限スクロール用の監視要素 */}
            <div ref={observerTarget} className="h-4 my-8" />

            {/* 手動で「もっと読み込む」ボタン */}
            {hasMore && repositories.length > 0 && (
                <div className="flex justify-center mt-6 mb-8">
                    <Button onClick={loadMore} disabled={loading} variant="outline">
                        {loading ? "読み込み中..." : "もっと読み込む"}
                    </Button>
                </div>
            )}
        </div>
    );
}
