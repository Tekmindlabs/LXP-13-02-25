import { Card, CardContent } from "@/components/ui/card";
import { FileIcon } from "lucide-react";
import { 
	CurriculumResource, 
	CurriculumActivity,
	FileInfo,
	QuizContent,
	AssignmentContent,
	DiscussionContent,
	ProjectContent
} from "@/types/curriculum";

// Resource Preview Components
export const VideoPreview: React.FC<{url: string}> = ({url}) => (
	<div className="aspect-video rounded-lg overflow-hidden">
		<iframe 
			src={url} 
			className="w-full h-full"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
		/>
	</div>
);

export const LinkPreview: React.FC<{url: string}> = ({url}) => (
	<a 
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		className="text-blue-600 hover:underline break-all"
	>
		{url}
	</a>
);

export const DocumentPreview: React.FC<{fileInfo: FileInfo}> = ({fileInfo}) => (
	<Card>
		<CardContent className="p-4">
			<div className="flex items-center gap-2">
				<FileIcon className="h-6 w-6" />
				<span>{fileInfo.name}</span>
			</div>
		</CardContent>
	</Card>
);

// Activity Preview Components
export const QuizPreview: React.FC<{content: QuizContent}> = ({content}) => (
	<Card>
		<CardContent className="p-4">
			<h3 className="font-semibold mb-2">Quiz Questions</h3>
			<div className="space-y-2">
				{content.questions?.map((q, i) => (
					<div key={i} className="border p-2 rounded">
						<p className="font-medium">{q.question}</p>
					</div>
				))}
			</div>
		</CardContent>
	</Card>
);

export const AssignmentPreview: React.FC<{content: AssignmentContent}> = ({content}) => (
	<Card>
		<CardContent className="p-4">
			<div className="prose max-w-none">
				<h3>Instructions</h3>
				<div dangerouslySetInnerHTML={{ __html: content.instructions }} />
			</div>
		</CardContent>
	</Card>
);

export const DiscussionPreview: React.FC<{content: DiscussionContent}> = ({content}) => (
	<Card>
		<CardContent className="p-4">
			<h3 className="font-semibold mb-2">Discussion Topic</h3>
			<p>{content.topic}</p>
			{content.guidelines && (
				<div className="mt-4">
					<h4 className="font-medium">Guidelines</h4>
					<ul className="list-disc pl-4">
						{content.guidelines.map((g, i) => (
							<li key={i}>{g}</li>
						))}
					</ul>
				</div>
			)}
		</CardContent>
	</Card>
);

export const ProjectPreview: React.FC<{content: ProjectContent}> = ({content}) => (
	<Card>
		<CardContent className="p-4">
			<div className="space-y-4">
				<div>
					<h3 className="font-semibold">Project Description</h3>
					<p>{content.description}</p>
				</div>
				{content.objectives && (
					<div>
						<h4 className="font-medium">Learning Objectives</h4>
						<ul className="list-disc pl-4">
							{content.objectives.map((o, i) => (
								<li key={i}>{o}</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</CardContent>
	</Card>
);