import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RepositoryDetail } from "@/lib/github";
import Image from "next/image";
import Link from "next/link";

/**
 * リポジトリ詳細コンポーネントのプロパティ
 */
interface RepositoryDetailProps {
  /**
   * リポジトリの詳細情報
   */
  repository: RepositoryDetail;
}

/**
 * リポジトリの詳細情報を表示するコンポーネント
 */
export function RepositoryDetailComponent({
  repository,
}: RepositoryDetailProps) {
  // 日付フォーマット用の関数
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // リポジトリの統計情報の項目定義
  const stats = [
    { label: "Star", value: repository.stargazers_count, icon: "★" },
    { label: "Watcher", value: repository.watchers_count, icon: "👁️" },
    { label: "Fork", value: repository.forks_count, icon: "🍴" },
    { label: "Issue", value: repository.open_issues_count, icon: "⚠️" },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{repository.name}</h1>
            <p className="text-lg text-muted-foreground">
              {repository.full_name}
            </p>
          </div>
          <div>
            <Link
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>GitHubで表示</Button>
            </Link>
          </div>
        </div>

        {repository.description && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">説明</h2>
            <p className="text-gray-700">{repository.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            <dl className="grid grid-cols-1 gap-3">
              {repository.language && (
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-gray-500">
                    主要言語
                  </dt>
                  <dd className="mt-1">
                    <Badge>{repository.language}</Badge>
                  </dd>
                </div>
              )}
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-gray-500">作成日</dt>
                <dd className="mt-1">{formatDate(repository.created_at)}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-gray-500">
                  最終更新日
                </dt>
                <dd className="mt-1">{formatDate(repository.updated_at)}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-gray-500">
                  最終プッシュ日
                </dt>
                <dd className="mt-1">{formatDate(repository.pushed_at)}</dd>
              </div>
              {repository.license && (
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-gray-500">
                    ライセンス
                  </dt>
                  <dd className="mt-1">{repository.license.name}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">統計情報</h2>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-2xl font-bold">
                      {stat.value.toLocaleString()}
                    </span>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {repository.topics && repository.topics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">トピック</h2>
            <div className="flex flex-wrap gap-2">
              {repository.topics.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center gap-3">
            <Link
              href={`https://github.com/${repository.owner.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Image
                src={repository.owner.avatar_url}
                alt={`${repository.owner.login}のアバター`}
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
              <span>{repository.owner.login}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
