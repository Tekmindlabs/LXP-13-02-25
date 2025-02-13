import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NovelEditor } from "@/components/ui/novel-editor";
import type { CurriculumResourceType } from ".prisma/client";


import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Plus, FileText, Video, Link, File, Trash2, Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon } from "lucide-react";





interface ResourceFormProps {
	nodeId: string;
	onSuccess: () => void;
	onCancel: () => void;
	refetch: () => Promise<void>;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ nodeId, onSuccess, onCancel, refetch }) => {
	const [title, setTitle] = useState("");
	const [type, setType] = useState<CurriculumResourceType>("READING");
	const [content, setContent] = useState("");

	const createResource = api.curriculum.createResource.useMutation({
		onSuccess: async (data) => {
			console.log('Resource created successfully:', data);
			await refetch();
			onSuccess();
			setTitle("");
			setType("READING");
			setContent("");
		},
		onError: (error) => {
			console.error("Failed to create resource:", error);
			// You might want to add error UI here
		}
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !content.trim()) {
			console.error("Title and content are required");
			return;
		}

		try {
			console.log('Creating resource with data:', {
				title: title.trim(),
				type,
				content: content.trim(),
				nodeId,
			});
			
			await createResource.mutateAsync({
				title: title.trim(),
				type,
				content: content.trim(),
				nodeId,
			});
		} catch (error) {
			console.error("Error creating resource:", error);
		}
	};

	const renderContentInput = () => {
		switch (type) {
			case "READING":
				return (
					<div className="relative min-h-[300px] w-full">
						<NovelEditor
							value={content}
							onChange={setContent}
							placeholder="Start writing your content..."
							className="min-h-[300px]"
						/>
					</div>
				);


			case "VIDEO":
			case "URL":
				return (
					<Input
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder={`Enter ${type.toLowerCase()} URL`}
					/>
				);
			case "DOCUMENT":
				return (
					<Textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="Document content"
						rows={4}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<Card className="relative">
			<CardContent className="space-y-4 pt-4">
				<Input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Resource title"
				/>
				<Select value={type} onValueChange={(value) => setType(value as CurriculumResourceType)}>
					<SelectTrigger>
						<SelectValue placeholder="Select resource type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="READING">Reading</SelectItem>
						<SelectItem value="VIDEO">Video</SelectItem>
						<SelectItem value="URL">URL</SelectItem>
						<SelectItem value="DOCUMENT">Document</SelectItem>
					</SelectContent>
				</Select>
				{renderContentInput()}
				<div className="flex justify-end space-x-2">
					<Button variant="outline" onClick={onCancel}>Cancel</Button>
					<Button 
						onClick={handleSubmit} 
						disabled={createResource.status === 'pending'}
					>
						Add Resource
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

const ResourceIcon: React.FC<{ type: CurriculumResourceType }> = ({ type }) => {
	switch (type) {
		case "READING":
			return <FileText className="h-4 w-4" />;
		case "VIDEO":
			return <Video className="h-4 w-4" />;
		case "URL":
			return <Link className="h-4 w-4" />;
		case "DOCUMENT":
			return <File className="h-4 w-4" />;
		default:
			return null;
	}
};

interface ResourceNode {
	id: string;
	resources: {
		id: string;
		title: string;
		type: CurriculumResourceType;
		content: string;
	}[];
}

interface ResourceManagerProps {
	nodeId: string;
}

export const ResourceManager: React.FC<ResourceManagerProps> = ({ nodeId }) => {
	const [showForm, setShowForm] = useState(false);
	const { data: nodes, refetch } = api.curriculum.getNodes.useQuery({ 
		subjectId: nodeId 
	}, {
		refetchOnWindowFocus: false,
		onError: (error) => {
			console.error("Error fetching nodes:", error);
		},
		onSuccess: (data) => {
			console.log('Fetched nodes:', data);
		}
	});
	const deleteResource = api.curriculum.deleteResource.useMutation({
		onSuccess: () => {
			console.log('Resource deleted successfully');
			void refetch();
		},
		onError: (error) => {
			console.error("Error deleting resource:", error);
		}
	});

	const handleDelete = async (id: string) => {
		await deleteResource.mutateAsync(id);
	};

	return (
		<div className="space-y-4 h-full flex flex-col">
			<div className="flex justify-between items-center sticky top-0 bg-background py-2">
				<h3 className="text-lg font-medium">Learning Resources</h3>
				<Button onClick={() => setShowForm(true)} disabled={showForm}>
					<Plus className="h-4 w-4 mr-2" />
					Add Resource
				</Button>
			</div>

			<div className="flex-1 overflow-y-auto">
				{showForm && (
					<ResourceForm
						nodeId={nodeId}
						refetch={refetch}
						onSuccess={() => {
							setShowForm(false);
						}}
						onCancel={() => setShowForm(false)}
					/>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{nodes?.map((node: ResourceNode) =>
						node.resources.map((resource) => (
							<Card key={resource.id}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<div className="flex items-center space-x-2">
										<ResourceIcon type={resource.type} />
										<CardTitle className="text-sm font-medium">
											{resource.title}
										</CardTitle>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleDelete(resource.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</CardHeader>
								<CardContent>
									{resource.type === "READING" ? (
										<div 
											className="prose prose-lg max-w-none dark:prose-invert focus:outline-none" 
											dangerouslySetInnerHTML={{ __html: resource.content }}
										/>
									) : (
										<CardDescription className="text-sm">
											{resource.content}
										</CardDescription>
									)}
								</CardContent>
							</Card>
						))
					)}
				</div>
			</div>
		</div>
	);
};