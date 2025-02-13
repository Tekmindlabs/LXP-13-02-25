import { useState } from "react";
import { api } from "@/utils/api";
import { CurriculumResourceType } from "@/types/curriculum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, FileText, Video, Link, File, Trash2 } from "lucide-react";

interface ResourceFormProps {
	nodeId: string;
	onSuccess: () => void;
	onCancel: () => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ nodeId, onSuccess, onCancel }) => {
	const [title, setTitle] = useState("");
	const [type, setType] = useState<CurriculumResourceType>("READING");
	const [content, setContent] = useState("");

	const createResource = api.curriculum.createResource.useMutation({
		onSuccess: () => {
			onSuccess();
			setTitle("");
			setType("READING");
			setContent("");
		},
	});

	const handleSubmit = async () => {
		await createResource.mutateAsync({
			title,
			type,
			content,
			nodeId,
		});
	};

	return (
		<Card>
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
				<Input
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Resource content or URL"
				/>
				<div className="flex justify-end space-x-2">
					<Button variant="outline" onClick={onCancel}>Cancel</Button>
					<Button onClick={handleSubmit} disabled={createResource.isLoading}>Add Resource</Button>
				</div>
			</CardContent>
		</Card>
	);
};

const ResourceIcon = ({ type }: { type: CurriculumResourceType }) => {
	switch (type) {
		case "READING":
			return <FileText className="h-4 w-4" />;
		case "VIDEO":
			return <Video className="h-4 w-4" />;
		case "URL":
			return <Link className="h-4 w-4" />;
		case "DOCUMENT":
			return <File className="h-4 w-4" />;
	}
};

interface ResourceManagerProps {
	nodeId: string;
}

export const ResourceManager: React.FC<ResourceManagerProps> = ({ nodeId }) => {
	const [showForm, setShowForm] = useState(false);
	const { data: resources, refetch } = api.curriculum.getNodes.useQuery({ 
		subjectId: nodeId 
	});
	const deleteResource = api.curriculum.deleteResource.useMutation({
		onSuccess: () => refetch(),
	});

	const handleDelete = async (id: string) => {
		await deleteResource.mutateAsync(id);
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-medium">Learning Resources</h3>
				<Button onClick={() => setShowForm(true)} disabled={showForm}>
					<Plus className="h-4 w-4 mr-2" />
					Add Resource
				</Button>
			</div>

			{showForm && (
				<ResourceForm
					nodeId={nodeId}
					onSuccess={() => {
						setShowForm(false);
						refetch();
					}}
					onCancel={() => setShowForm(false)}
				/>
			)}

			<div className="grid grid-cols-2 gap-4">
				{resources?.map((node) =>
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
								<CardDescription className="text-sm">
									{resource.content}
								</CardDescription>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
};