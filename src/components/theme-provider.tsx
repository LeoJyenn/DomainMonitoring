"use client";

import { useEffect, useState } from 'react';

export function ThemeProvider() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // 添加过渡样式到documentElement
        document.documentElement.classList.add('transition-colors');
        document.documentElement.style.transitionDuration = '500ms';

        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // 如果系统偏好深色模式，可取消下行注释以跟随系统
            // document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // 监听系统主题变化
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            const currentTheme = localStorage.getItem('theme');
            // 仅当用户未设置主题偏好时，跟随系统设置
            if (!currentTheme) {
                if (e.matches) {
                    // 可取消注释以跟随系统自动切换
                    // document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        setMounted(true);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
            // 清理过渡样式
            document.documentElement.classList.remove('transition-colors');
            document.documentElement.style.transitionDuration = '';
        };
    }, []);

    // 仅在客户端渲染后返回内容
    if (!mounted) return null;

    return null;
} 