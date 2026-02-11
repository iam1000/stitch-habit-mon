
import {
    Home,
    User,
    Trophy,
    ShoppingBag,
    Settings,
    LogOut,
    X,
    Book,
    Moon,
    Sun,
    Globe,
    TrendingUp,
    Tag,
    HelpCircle,
    CreditCard,
    PlusCircle,
    PenTool
} from 'lucide-react';

const iconMap = {
    Home,
    User,
    Trophy,
    ShoppingBag,
    Settings,
    LogOut,
    X,
    Book,
    Moon,
    Sun,
    Globe,
    TrendingUp,
    Tag,
    CreditCard,
    PlusCircle,
    PenTool
};

export const getIconComponent = (iconName) => {
    return iconMap[iconName] || HelpCircle; // 없을 경우 기본 아이콘
};
