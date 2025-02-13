import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import {
	Bold,
	Italic,
	Link as LinkIcon,
	Image as ImageIcon,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Palette,
	Highlighter,
} from 'lucide-react';

interface NovelEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function NovelEditor({
	value,
	onChange,
	placeholder = 'Start writing...',
	className = '',
}: NovelEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3]
				}
			}),
			Placeholder.configure({
				placeholder
			}),
			Image.configure({
				allowBase64: true,
				HTMLAttributes: {
					class: 'rounded-lg max-w-full',
				},
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'text-primary underline decoration-primary',
				},
			}),
			TextStyle,
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
			Color,
			Highlight.configure({
				multicolor: true,
			}),
		],
		content: value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: 'prose prose-lg focus:outline-none max-w-full',
			},
		},
	});

	if (!editor) {
		return null;
	}

	return (
		<div className={`relative border rounded-lg ${className}`}>
			<BubbleMenu 
				editor={editor} 
				className="flex items-center gap-1 rounded-md border bg-white p-1 shadow-md flex-wrap z-[100]"
				tippyOptions={{ duration: 100, zIndex: 100 }}
			>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={editor.isActive('bold') ? 'bg-muted' : ''}
				>
					<Bold className="h-4 w-4" />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={editor.isActive('italic') ? 'bg-muted' : ''}
				>
					<Italic className="h-4 w-4" />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						const url = window.prompt('Enter URL');
						if (url) {
							editor.chain().focus().setLink({ href: url }).run();
						}
					}}
					className={editor.isActive('link') ? 'bg-muted' : ''}
				>
					<LinkIcon className="h-4 w-4" />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						const url = window.prompt('Enter image URL');
						if (url) {
							editor.chain().focus().setImage({ src: url }).run();
						}
					}}
				>
					<ImageIcon className="h-4 w-4" />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().setTextAlign('left').run()}
					className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
				>
					<AlignLeft className="h-4 w-4" />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().setTextAlign('center').run()}
					className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
				>
					<AlignCenter className="h-4 w-4" />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().setTextAlign('right').run()}
					className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
				>
					<AlignRight className="h-4 w-4" />
				</Button>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className={editor.isActive('textStyle') ? 'bg-muted' : ''}
						>
							<Palette className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-3">
						<div className="space-y-2">
							<div className="text-sm font-medium">Text Color</div>
							<div className="flex flex-col gap-2">
								<input 
									type="color"
									defaultValue="#000000"
									onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
									className="w-32 h-8 cursor-pointer"
								/>
								<Button 
									variant="ghost" 
									size="sm"
									onClick={() => editor.chain().focus().unsetColor().run()}
									className="mt-1"
								>
									Remove Color
								</Button>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className={editor.isActive('highlight') ? 'bg-muted' : ''}
						>
							<Highlighter className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-3">
						<div className="space-y-2">
							<div className="text-sm font-medium">Highlight Color</div>
							<div className="flex flex-col gap-2">
								<input 
									type="color"
									defaultValue="#FFEB3B"
									onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
									className="w-32 h-8 cursor-pointer"
								/>
								<Button 
									variant="ghost" 
									size="sm"
									onClick={() => editor.chain().focus().unsetHighlight().run()}
									className="mt-1"
								>
									Remove Highlight
								</Button>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</BubbleMenu>

			<EditorContent 
				editor={editor} 
				className="p-4 min-h-[200px] focus:outline-none"
			/>
		</div>
	);
}

