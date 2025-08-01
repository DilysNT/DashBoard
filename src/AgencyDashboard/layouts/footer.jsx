export const Footer = () => {
    return (
        <footer className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <p className="text-base font-medium text-slate-900 dark:text-slate-50"></p>
            <div className="flex flex-wrap gap-x-2">
                <a
                    href="#"
                    className="link"
                >
                    Chính sách bảo mật
                </a>
                <span className="text-gray-400">|</span>
                <a
                    href="#"
                    className="link"
                >
                    Điều khoản dịch vụ
                </a>
            </div>
        </footer>
    );
};
