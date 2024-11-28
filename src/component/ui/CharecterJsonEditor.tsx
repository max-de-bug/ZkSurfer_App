import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, CheckCircle } from 'lucide-react';
// import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CharacterJsonEditorProps {
    initialJson: any;
    onConfirm: (editedJson: any) => void;
    onCancel?: () => void;
}

const CharacterJsonEditor: React.FC<CharacterJsonEditorProps> = ({
    initialJson,
    onConfirm,
    onCancel
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [jsonText, setJsonText] = useState('');
    const [parseError, setParseError] = useState<string | null>(null);

    // Initialize the JSON text when the component mounts or initialJson changes
    useEffect(() => {
        try {
            // Pretty print the initial JSON
            setJsonText(JSON.stringify(initialJson, null, 2));
        } catch (error) {
            console.error('Error parsing initial JSON', error);
            setJsonText(JSON.stringify(initialJson));
        }
    }, [initialJson]);

    const handleEdit = () => {
        setIsEditing(true);
        setParseError(null);
    };

    const handleConfirm = () => {
        try {
            // Attempt to parse the edited JSON
            const parsedJson = JSON.parse(jsonText);

            // Clear any previous parse errors
            setParseError(null);

            // Exit editing mode
            setIsEditing(false);

            // Call the confirmation handler with the parsed JSON
            onConfirm(parsedJson);
        } catch (error) {
            // Set error if JSON is invalid
            setParseError('Invalid JSON. Please check your syntax.');
        }
    };

    const handleCancel = () => {
        // Reset to original JSON
        setJsonText(JSON.stringify(initialJson, null, 2));
        setIsEditing(false);
        setParseError(null);

        // Call optional cancel handler
        onCancel?.();
    };

    return (
        <Card className="w-full max-w-2xl bg-[#171D3D] text-white">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Character JSON Editor
                    {!isEditing && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleEdit}
                            className="text-[#BDA0FF] hover:bg-[#24284E]"
                        >
                            <Pencil className="h-5 w-5" />
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {parseError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{parseError}</AlertDescription>
                    </Alert>
                )}
                {isEditing ? (
                    <textarea
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        className="w-full min-h-[400px] bg-[#24284E] text-white font-mono p-2"
                        spellCheck={false}
                    />
                ) : (
                    <pre className="bg-[#24284E] p-4 rounded-md overflow-x-auto">
                        <code>{jsonText}</code>
                    </pre>
                )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                {isEditing ? (
                    <>
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="text-[#BDA0FF] border-[#BDA0FF]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="bg-gradient-to-r from-[#BDA0FF] to-[#6D47FF]"
                        >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Confirm
                        </Button>
                    </>
                ) : (
                    <Button
                        onClick={() => onConfirm(initialJson)}
                        className="bg-gradient-to-r from-[#BDA0FF] to-[#6D47FF]"
                    >
                        Confirm
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default CharacterJsonEditor;