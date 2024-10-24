import { useState } from "react";

const useTabToggle = (initialValue : any) => {
    const [activeTab, setActiveTab] = useState(initialValue);
    const onToggle = (tab: any) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    return ([activeTab, onToggle]) as const;
};

export default useTabToggle;
