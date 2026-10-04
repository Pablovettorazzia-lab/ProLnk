CREATE TABLE "forum_votes" (
	"post_id" text,
	"user_id" text,
	CONSTRAINT "forum_votes_pkey" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "forum_votes" ADD CONSTRAINT "forum_votes_post_id_forum_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE;