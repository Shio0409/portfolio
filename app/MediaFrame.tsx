import type { CSSProperties } from "react";
import type { PortfolioMedia } from "./portfolio-data";

type MediaFrameProps = {
  asset: PortfolioMedia;
  className?: string;
  eager?: boolean;
};

export default function MediaFrame({ asset, className = "", eager = false }: MediaFrameProps) {
  return (
    <div className={`media-frame ${className}`.trim()} data-media-kind={asset.kind} style={{ "--media-focus": asset.focalPoint ?? "50% 50%" } as CSSProperties}>
      {asset.kind === "video" ? (
        <video
          aria-label={asset.alt}
          autoPlay={asset.autoPlay ?? true}
          controls={asset.controls ?? false}
          loop={asset.loop ?? true}
          muted={asset.muted ?? true}
          playsInline
          poster={asset.poster}
          preload={eager ? "auto" : "metadata"}
          src={asset.src}
        >
          <track default kind="captions" label="日本語" src={asset.captions} srcLang="ja" />
        </video>
      ) : (
        // Native images keep this frame compatible with user-supplied local media paths.
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={asset.alt} decoding="async" fetchPriority={eager ? "high" : "auto"} loading={eager ? "eager" : "lazy"} src={asset.src} />
      )}
      {asset.label && <span className="media-frame-label">{asset.label}</span>}
    </div>
  );
}
