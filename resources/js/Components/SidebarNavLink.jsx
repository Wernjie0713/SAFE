import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

export default function SidebarNavLink({
    active = false,
    className = '',
    children,
    icon,
    href,
    ...props
}) {
    const { url } = usePage();
    
    // Enhanced active state detection
    const isActive = active || (() => {
        // Remove trailing slashes for comparison
        const currentPath = url.endsWith('/') ? url.slice(0, -1) : url;
        const linkPath = typeof href === 'string' && href.startsWith('/') 
            ? (href.endsWith('/') ? href.slice(0, -1) : href)
            : href;
        
        // For direct paths, compare the actual URL paths
        if (typeof href === 'string' && href.startsWith('/')) {
            return currentPath === linkPath;
        }
        
        // For route names, use route().current()
        return route().current(href);
    })();

    return (
        <Link
            href={typeof href === 'string' && href.startsWith('/') ? href : route(href)}
            {...props}
            className={
                'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ' +
                (isActive
                    ? 'bg-gray-700 text-white border-r-4 border-blue-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50') +
                ' ' + className
            }
        >
            {icon && (
                <span className={`mr-3 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    {icon}
                </span>
            )}
            {children}
        </Link>
    );
} 