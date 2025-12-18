const el = wp.element.createElement;
const { useState } = wp.element;
const { PluginDocumentSettingPanel } = wp.editor;
const { TextControl, TextareaControl, Button, Spinner } = wp.components;
const { registerPlugin } = wp.plugins;
const { dispatch, useSelect } = wp.data;
const { enums, helpers, store: aiStore } = window.aiServices.ai;

// Analyze the content thoroughly and write a new, unique, professional, and well-structured blog in WordPress format for a website that is about senior loneliness. Tie the article into how it pertains to senior loneliness. Just return the content of the new article ready for release. Do not include tags, categories or images.

const AI_CAPABILITIES = [ enums.AiCapability.TEXT_GENERATION ];

const AICurator_Block = () => {
	const [ url, setUrl ] = useState( '' );
	const [ modelPrompt, setModelPrompt ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( false );

	// Select the available AI Service
	const service = useSelect( ( select ) =>
		select( aiStore ).getAvailableService( AI_CAPABILITIES )
	);

	const handleGenerate = async () => {
		if ( !service || !url || !modelPrompt ) {
			return;
		}

		setIsLoading( true );

		const prompt = {
			role: enums.ContentRole.USER,
			parts: [
				{
					text: `Fetch content from this URL: ${url}. ${modelPrompt}`,
				},
			],
		};

		try {
			// Call the AI Service to generate text
			const candidates = await service.generateText(
				prompt,
				{
					feature: 'ai-curator'
				}
			);

			// Extract the plain text from the response candidates
			const content = helpers
				.getTextFromContents(
					helpers.getCandidateContents( candidates )
				);

			if ( content ) {
				// Parse the generated text into WordPress blocks
				const blocks = wp.blocks.parse( content );

				// Insert the new blocks into the core/block-editor
				await dispatch( 'core/block-editor' ).insertBlocks( blocks );

				// Clear URL after successful generation
				setUrl( '' );
			}
		} catch ( error ) {
			wp.data.dispatch('core/notices').createErrorNotice(
				'AI Curator: ' + error.message,
				{
					isDismissible: true,
					id: 'ai-curator-error'
				}
			);

			console.error( error );
		} finally {
			setIsLoading( false );
		}
	};

	// Render the sidebar block UI
	return el( PluginDocumentSettingPanel, {
			name: 'ai-curator-panel',
			icon: 'admin-site',
			title: 'AI Curator',
		},
		el( 'p', {}, 'Enter a URL and instructions to curate a new post.' ),
		el( TextControl, {
			label: 'Source URL',
			value: url,
			onChange: ( val ) => setUrl( val )
		} ),
		el( TextareaControl, {
			label: 'Model instructions',
			value: modelPrompt,
			onChange: ( val ) => setModelPrompt( val )
		} ),

		// The Button element is disabled while loading or if inputs are missing
		el( Button, {
			isPrimary: true,
			onClick: handleGenerate,
			disabled: isLoading || !url || !service || !modelPrompt
		}, isLoading ? 'Curating...' : 'Curate Content' ),

		// Show a spinner while the operation is in progress
		isLoading && el( Spinner )
	);
};

// Register the plugin with the WordPress editor
registerPlugin( 'ai-curator-plugin', {
	render: AICurator_Block,
	icon: 'admin-site'
} );