import { RepositoryDetailComponent } from "@/components/repository-detail";
import { Button } from "@/components/ui/button";
import { getRepositoryDetail } from "@/lib/github";
import Link from "next/link";
import { notFound } from "next/navigation";

// 詳細ページのパラメータ型
// interface RepositoryDetailPageProps {
//   params: {
//     fullName: string;
//   };
// }

type Params = Promise<{
  fullName: string;
}>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * リポジトリ詳細ページ（サーバーコンポーネント）
 */
export default async function RepositoryDetailPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  // URLからフルネームを取得
  const fullName = decodeURIComponent(params.fullName);

  // オーナーとリポジトリ名を分割
  const [owner, repo] = fullName.split("/");

  if (!owner || !repo) {
    return notFound();
  }

  try {
    // APIからリポジトリ詳細を取得
    const repositoryDetail = await getRepositoryDetail(owner, repo);

    return (
      <main className="container mx-auto py-8 px-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/" className="flex items-center">
            ← 検索結果に戻る
          </Link>
        </Button>
        <RepositoryDetailComponent repository={repositoryDetail} />
      </main>
    );
  } catch (error) {
    // 404エラーの場合はNotFoundページを表示
    if ((error as Error).message.includes("404")) {
      return notFound();
    }

    // その他のエラー
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/" className="flex items-center">
              ← 検索結果に戻る
            </Link>
          </Button>
        </div>

        <div className="bg-destructive/10 text-destructive p-8 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
          <p className="mb-4">{(error as Error).message}</p>
          <p>時間をおいてから再度お試しください。</p>
        </div>
      </main>
    );
  }
}
