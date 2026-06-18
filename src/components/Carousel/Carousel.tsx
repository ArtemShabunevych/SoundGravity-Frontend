import { useRef, useState, type ReactNode } from "react";
import styles from "./carousel.module.css";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface CarouselItem {
    id: string;
    coverUrl?: string;
    title: string;
    description?: string;
}

interface CarouselProps {
    title: string;
    items: CarouselItem[];
    onSeeAll?: () => void;
    renderCard?: (item: CarouselItem) => ReactNode;
}

function DefaultCard({ item }: { item: CarouselItem }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardCover}>
                {item.coverUrl ? (
                    <img src={item.coverUrl} alt={item.title} className={styles.cardImg} />
                ) : (
                    <div className={styles.cardFallback} />
                )}
            </div>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            {item.description && (
                <p className={styles.cardDesc}>{item.description}</p>
            )}
        </div>
    );
}

export default function Carousel({ title, items, onSeeAll, renderCard }: CarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const scroll = (direction: "left" | "right") => {
        if (!trackRef.current) return;
        const { scrollLeft, clientWidth, scrollWidth } = trackRef.current;
        const step = clientWidth * 0.75;
        const target = direction === "left"
            ? Math.max(0, scrollLeft - step)
            : Math.min(scrollWidth - clientWidth, scrollLeft + step);
        trackRef.current.scrollTo({ left: target, behavior: "smooth" });
    };

    const handleScroll = () => {
        if (!trackRef.current) return;
        const { scrollLeft, clientWidth, scrollWidth } = trackRef.current;
        setShowLeft(scrollLeft > 4);
        setShowRight(scrollLeft + clientWidth < scrollWidth - 4);
    };

    if (!items.length) return null;

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.sectionTitle}>{title}</h2>
                {onSeeAll && (
                    <button className={styles.seeAll} onClick={onSeeAll}>
                        Show all
                    </button>
                )}
            </div>

            <div className={styles.wrapper}>
                {showLeft && (
                    <button
                        className={`${styles.arrow} ${styles.arrowLeft}`}
                        onClick={() => scroll("left")}
                        aria-label="Scroll left"
                    >
                        <ChevronLeftIcon />
                    </button>
                )}

                <div
                    ref={trackRef}
                    className={styles.track}
                    onScroll={handleScroll}
                >
                    {items.map((item) =>
                        renderCard ? (
                            <div key={item.id} className={styles.cardWrapper}>
                                {renderCard(item)}
                            </div>
                        ) : (
                            <div key={item.id} className={styles.cardWrapper}>
                                <DefaultCard item={item} />
                            </div>
                        )
                    )}
                </div>

                {showRight && (
                    <button
                        className={`${styles.arrow} ${styles.arrowRight}`}
                        onClick={() => scroll("right")}
                        aria-label="Scroll right"
                    >
                        <ChevronRightIcon />
                    </button>
                )}
            </div>
        </div>
    );
}
