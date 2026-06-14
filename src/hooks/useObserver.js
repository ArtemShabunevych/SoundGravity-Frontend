import {useEffect, useRef} from "react";

export const useObserver = (ref, canLoad, isLoading ,callback) => {
    const observer = useRef()

    useEffect(() => {
        if(isLoading) return
        if(observer.current) observer.current.disconnect()
        let cb = (entries, observer) => {
            console.log('See')
        }

        observer.current = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && canLoad) {
                callback()
            }
        });

        observer.current.observe(ref.current);
    }, [isLoading, canLoad]);

}