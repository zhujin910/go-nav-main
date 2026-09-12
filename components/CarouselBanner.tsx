"use client";
import { useEffect, useMemo, useState } from "react";
import type { CarouselItem } from "@/types";

interface Props {
  list: CarouselItem[];
}

export default function CarouselBanner({ list }: Props) {
  const validList = useMemo(() => list.filter((item) => item.enable), [list]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent((value) =>
      validList.length === 0 ? 0 : Math.min(value, validList.length - 1),
    );
    if (validList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % validList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [validList.length]);

  if (validList.length === 0) return null;

  return (
    <div className="relative mb-6 h-48 w-full overflow-hidden rounded-xl md:h-72">
      {validList.map((item,idx)=>(
        <a
          key={item.id}
          href={item.link}
          target="_blank"
          className={`absolute inset-0 transition-opacity duration-500 ${idx === current ? "opacity-100" : "opacity-0"}`}
        >
          {/* 后台可配置本地上传或任意远程地址，避免 next/image 域名白名单限制。 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.title}
            width={1280}
            height={360}
            loading={idx === 0 ? "eager" : "lazy"}
            fetchPriority={idx === 0 ? "high" : "auto"}
            decoding="async"
            className={`size-full object-cover ${idx === current && item.dynamicEffect === true ? "carousel-banner__image--dynamic" : ""}`}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-4 text-white">
            <h3 className="text-lg font-bold">{item.title}</h3>
            <p className="text-sm opacity-90">{item.desc}</p>
          </div>
        </a>
      ))}
      <div className="absolute bottom-2 right-3 flex gap-1">
        {validList.map((_,i)=>(
          <button
            key={i}
            onClick={()=>setCurrent(i)}
            className={`h-2 w-2 rounded-full ${i === current ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}