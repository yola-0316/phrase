export default function Footer() {
  return (
    <footer className="row-start-3 flex gap-4 flex-wrap items-center justify-center text-sm text-zinc-400">
      <p className="flex items-center">
        Inspired with ❤️ &&nbsp;
        <a
          className="hover:underline hover:underline-offset-4"
          href="https://hitokoto.cn/"
          target="_blank"
          rel="noopener noreferrer"
        >
          一言
        </a>
      </p>
      <p>by</p>
      <p>@zed</p>

      {/* <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://www.jinrishici.com/"
        target="_blank"
        rel="noopener noreferrer"
      >

        今日诗词
      </a> */}
    </footer>
  );
}
