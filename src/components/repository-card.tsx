import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { GitHubRepository } from "@/lib/github";
import Image from "next/image";
import Link from "next/link";

interface RepositoryCardProps {
  repository: GitHubRepository;
}

/**
 * リポジトリカードコンポーネント
 * サーバー/クライアント両方で利用可能
 */
export function RepositoryCard({ repository }: RepositoryCardProps) {
  const {
    full_name,
    description,
    language,
    stargazers_count,
    forks_count,
    owner,
  } = repository;

  // URLエンコード済みのリポジトリ名（リンク用）
  const encodedFullName = encodeURIComponent(full_name);

  return (
    <Link
      href={`/repository/${encodedFullName}`}
      className="block transition-transform hover:scale-[1.02]"
      data-testid="repository-card-link"
    >
      <Card className="h-full hover:shadow-md transition-shadow px-5">
        <CardHeader className="pb-2 flex flex-row items-center space-x-2">
          <Image
            src={owner.avatar_url}
            alt={`${owner.login}のアバター`}
            width={32}
            height={32}
            className="rounded-full"
          />
          <h2 className="font-semibold text-lg line-clamp-1" title={full_name}>
            {full_name}
          </h2>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[40px]">
            {description || "説明なし"}
          </p>

          {language && (
            <Badge variant="outline" className="mr-2 bg-primary/10">
              {language}
            </Badge>
          )}
        </CardContent>

        <CardFooter className="mb-0 flex justify-between text-sm text-muted-foreground">
          <div title={`${stargazers_count.toLocaleString()} スター`}>
            ★ {stargazers_count.toLocaleString()}
          </div>
          <div title={`${forks_count.toLocaleString()} フォーク`}>
            🍴 {forks_count.toLocaleString()}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
