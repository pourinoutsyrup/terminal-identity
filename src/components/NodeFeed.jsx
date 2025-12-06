export default function NodeFeed({ posts }) {
  return (
    <div className="flex flex-col gap-6">
      {posts.map((post, i) => (
        <div key={post.id}>
          <article className="post-node">
            <div className="text-white text-base mb-2">{post.content}</div>
            <div className="flex items-center gap-3 text-xs text-zinc-600">
              <span>@{post.author}</span>
              <span>{post.date}</span>
              <span>{post.moonGlyph}</span>
            </div>
          </article>
          {i < posts.length - 1 && (
            <div className="hermetic-divider my-4">═══════════════════════</div>
          )}
        </div>
      ))}
    </div>
  );
}