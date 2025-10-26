// components/blog/BlogHero.tsx
interface BlogHeroProps {
  coverImage: string;
  title: string;
  createdAt: string;
  tags: string[];
}

const BlogHero = ({ coverImage, title, createdAt, tags }: BlogHeroProps) => (
  <div className="relative">
    <img src={coverImage} alt={title} className="w-full h-60 object-cover rounded-t-lg" />
    <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 text-white">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm">{createdAt}</p>
      <div className="flex gap-2 mt-2 flex-wrap">
        {tags.map((tag, idx) => (
          <span key={idx} className="bg-white/20 px-2 py-1 rounded-full text-xs">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default BlogHero;
