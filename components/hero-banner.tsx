"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { Autoplay, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide, type SwiperClass } from "swiper/react";
import type { HeroSlide } from "@/types";

interface HeroBannerProps {
	slides: HeroSlide[];
	height?: string;
	autoplayInterval?: number;
}

function resolveSlideUrl(rawUrl?: string): string | undefined {
	const value = rawUrl?.trim();
	if (!value) return undefined;
	if (/^(https?:|mailto:|tel:|\/)/i.test(value)) return value;
	return `https://${value}`;
}

function HeroSlideCard({ slide }: { slide: HeroSlide }) {
	const slideUrl = resolveSlideUrl(slide.url);
	const textColor = slide.textColor ?? "light";
	const overlay = slide.overlay ?? 0.3;
	const isLight = textColor === "light";

	const content = (
		<div className="relative h-full w-full overflow-hidden">
			{/* 背景图 */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={slide.image}
				alt={slide.title}
				className={`absolute inset-0 h-full w-full object-cover ${slide.dynamicEffect === true ? "carousel-banner__image--dynamic" : ""}`}
				loading="eager"
			/>
			{/* 遮罩层 */}
			<div
				className="absolute inset-0"
				style={{
					background: isLight
						? `linear-gradient(135deg, rgba(0,0,0,${overlay}) 0%, rgba(0,0,0,${overlay * 0.5}) 100%)`
						: `linear-gradient(135deg, rgba(255,255,255,${overlay}) 0%, rgba(255,255,255,${overlay * 0.5}) 100%)`,
				}}
			/>
			{/* 文字内容 */}
			<div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start px-6 pb-2 md:px-12 md:pb-4 lg:px-20">
				<h2
					className="hero-banner__title text-2xl md:text-4xl lg:text-5xl"
				>
					{slide.title}
				</h2>
				{slide.description && (
					<p
						className="hero-banner__description mt-2 max-w-2xl text-sm md:text-base lg:text-lg"
					>
						{slide.description}
					</p>
				)}
				{slide.buttonText && slideUrl && (
					<a
						href={slideUrl}
						target="_blank"
						rel="noopener noreferrer"
						className={`mt-5 inline-flex w-fit items-center rounded-full px-6 py-2.5 text-sm font-semibold transition md:text-base ${
							isLight
								? "bg-white text-zinc-900 hover:bg-white/90"
								: "bg-zinc-900 text-white hover:bg-zinc-800"
						}`}
					>
						{slide.buttonText}
						<BiChevronRight className="ml-1 size-5" />
					</a>
				)}
			</div>
		</div>
	);

	// 如果有跳转链接且没有按钮，整张图可点击
	if (slideUrl && !slide.buttonText) {
		return (
			<a
				href={slideUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="block h-full w-full"
			>
				{content}
			</a>
		);
	}

	return content;
}

export function HeroBanner({
	slides,
	height = "320px",
	autoplayInterval = 5000,
}: HeroBannerProps) {
	const swiperRef = useRef<SwiperClass | null>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const total = slides.length;

	const updateActiveIndex = useCallback(
		(instance: SwiperClass) => {
			if (total > 0) setActiveIndex(instance.realIndex % total);
		},
		[total],
	);

	if (total === 0) return null;

	const containerStyle = {
		height,
		"--hero-banner-height": height,
	} as CSSProperties;

	return (
		<div
			className="hero-banner relative mb-1 w-full overflow-hidden rounded-xl shadow-sm"
			style={containerStyle}
			role="region"
			aria-roledescription="carousel"
			aria-label="首页轮播图"
		>
			<Swiper
				modules={[Autoplay, Keyboard, Pagination]}
				className="h-full"
				slidesPerView={1}
				loop={total > 1}
				speed={600}
				grabCursor={total > 1}
				keyboard={{ enabled: true, onlyInViewport: true }}
				pagination={{
					clickable: true,
					el: ".hero-banner__pagination",
				}}
				autoplay={
					total > 1
						? {
								delay: autoplayInterval,
								disableOnInteraction: false,
								pauseOnMouseEnter: true,
							}
						: false
				}
				onSwiper={(instance) => {
					swiperRef.current = instance;
					updateActiveIndex(instance);
				}}
				onActiveIndexChange={updateActiveIndex}
				onRealIndexChange={updateActiveIndex}
			>
				{slides.map((slide, index) => (
					<SwiperSlide key={slide.id} className="h-full">
						<HeroSlideCard slide={slide} />
					</SwiperSlide>
				))}
			</Swiper>

			{/* 左右箭头 */}
			{total > 1 && (
				<>
					<button
						type="button"
						aria-label="上一张"
						className="absolute left-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-zinc-800 shadow-md backdrop-blur transition hover:bg-white md:flex"
						onClick={() => swiperRef.current?.slidePrev()}
					>
						<BiChevronLeft className="size-6" />
					</button>
					<button
						type="button"
						aria-label="下一张"
						className="absolute right-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-zinc-800 shadow-md backdrop-blur transition hover:bg-white md:flex"
						onClick={() => swiperRef.current?.slideNext()}
					>
						<BiChevronRight className="size-6" />
					</button>
				</>
			)}

			{/* 底部分页指示器 */}
			<div className="hero-banner__pagination absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5" />

			{/* 屏幕阅读器提示 */}
			<p className="sr-only" aria-live="polite">
				当前第 {activeIndex + 1} 张，共 {total} 张：{slides[activeIndex]?.title}
			</p>
		</div>
	);
}