import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface AccordionProps {
    isToggle?: boolean;
    title: () => JSX.Element;
    children: React.ReactNode;
    btnClass?: string;
    btnAction?: () => void;
}

const Accordion = ({ isToggle, title, children, btnClass,btnAction }: AccordionProps) => {
    const [open, setOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isToggle) {
            setOpen(true);
        }
    }, [isToggle]);

    const handleToggle = () => {
        setOpen(!open);
        if (!open == true && btnAction) {
            btnAction();
        }
    };

    return (
        <div className="w-full">
            <button onClick={handleToggle} className={`w-full ${btnClass || ''}`}>
                <div className="flex gap-2 justify-between ">
                    <div className="flex gap-2">
                        {title()}
                    </div>
                    <div className="self-center ml-5">
                        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
                    </div>
                </div>
            </button>
            <div
                ref={contentRef}
                style={{
                    maxHeight: open ? 'none' : '0px',
                    overflow: open ? 'visible' : 'hidden',
                    transition: 'max-height 0.3s ease, overflow 0.3s ease',
                }}
            >
                <div style={{ overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Accordion;
