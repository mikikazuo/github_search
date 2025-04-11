"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

interface SearchFormProps {
  initialQuery?: string;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
}

/**
 * 検索フォームコンポーネント
 */
export function SearchForm({
  initialQuery = "",
  isLoading = false,
  onSearch,
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (onSearch) {
      // コールバックがある場合はそれを呼び出す（テスト用など）
      onSearch(query);
    } else {
      // URLパラメータを更新して検索を実行
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }

      // URLを更新してページを再読み込み
      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2"
      data-testid="search-form"
    >
      <Input
        type="text"
        placeholder="リポジトリを検索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
        data-testid="search-input"
      />
      <Button type="submit" disabled={isLoading} data-testid="search-button">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            検索中...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            検索
          </>
        )}
      </Button>
    </form>
  );
}
