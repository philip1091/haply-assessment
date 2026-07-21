import type { ShapeType } from "../types/shape";

type ToolbarProps = {
    onAddShape: (type: ShapeType) => void;
};

function Toolbar({ onAddShape }: ToolbarProps) {
    return (
        <header className="toolbar">
            <h1>Haply Assessment</h1>

            <div className="toolbar-actions">
                <button type="button" onClick={() => onAddShape("cube")}>
                    Add Cube
                </button>
            </div>
        </header>
    );
}

export default Toolbar;