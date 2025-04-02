// "use client";
// import React, { useState, ChangeEvent, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';
// import { useWallet } from '@solana/wallet-adapter-react';

// interface EditAgentClientProps {
//   ticker: string;
//   dictionary: any;
//   image_base64?: string;
//   description?: string;
//   // initialUrls can be empty or have one mapped URL.
//   initialUrls: string[];
//   // For PDFs, we assume the initial strings are PDF content (base64) for preview.
//   initialPdfs: string[];
//   initialImages: string[];
// }

// interface PdfItem {
//   name: string;
//   // For initial PDFs, we store a dataUrl.
//   dataUrl?: string;
//   // For new PDFs, we keep the file reference.
//   file?: File;
//   isNew: boolean;
// }

// export default function EditAgentClient({
//   ticker,
//   dictionary,
//   image_base64,
//   description,
//   initialUrls,
//   initialPdfs,
//   initialImages,
// }: EditAgentClientProps) {
//   const router = useRouter();
//   const { publicKey } = useWallet();

//   // Determine if the primary URL is locked (i.e. already contains a forbidden domain)
//   // const primaryUrlLocked =
//   //   initialUrls[0] &&
//   //   (initialUrls[0].toLowerCase().includes("twitter.com") ||
//   //     initialUrls[0].toLowerCase().includes("x.com"));

//   const primaryUrlLocked = !!initialUrls[0] &&
//     (initialUrls[0].toLowerCase().includes("twitter.com") ||
//       initialUrls[0].toLowerCase().includes("x.com"));

//   // Primary URL – if one exists it is pre-populated.
//   const [url, setUrl] = useState(initialUrls[0] || '');
//   // Allow one extra URL only if a primary exists.
//   const [additionalUrl, setAdditionalUrl] = useState('');

//   // For PDFs, new uploads are stored as File objects.
//   const [newPdfFiles, setNewPdfFiles] = useState<File[]>([]);
//   // For image, allow one new file.
//   const [newImageFile, setNewImageFile] = useState<File | null>(null);

//   // Store mapped PDFs (assumed to be base64 content) from initial data.
//   const [pdfs, setPdfs] = useState<string[]>(initialPdfs);
//   const [image, setImage] = useState<string | null>(initialImages[0] || null);

//   const [isChanged, setIsChanged] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const user_id = publicKey ? publicKey.toString() : '';

//   // For PDF preview modal – stores the PDF name and dataUrl.
//   const [selectedPdf, setSelectedPdf] = useState<{ name: string; dataUrl: string } | null>(null);

//   const forbiddenDomains = ['twitter.com', 'x.com'];

//   // Check for forbidden domain on newly entered text.
//   const containsForbiddenDomain = (input: string) =>
//     forbiddenDomains.some(domain => input.toLowerCase().includes(domain));

//   // Handle changes to the primary URL input.
//   const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     // Only allow changes if the primary URL is not locked.
//     if (primaryUrlLocked) return;
//     const value = e.target.value;
//     // For newly added data, check for forbidden domains.
//     if (containsForbiddenDomain(value)) {
//       toast.error("currently x and twitter links cannot be added to knowledgebase in edit option");
//       return;
//     }
//     setUrl(value);
//     setIsChanged(true);
//   };

//   // Handle changes to the additional URL input.
//   const handleAdditionalUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     // Additional URL is always considered new so check for forbidden domains.
//     if (containsForbiddenDomain(value)) {
//       toast.error("currently x and twitter links cannot be added to knowledgebase in edit option");
//       return;
//     }
//     setAdditionalUrl(value);
//     setIsChanged(true);
//   };

//   // Allow multiple PDFs to be uploaded.
//   const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setNewPdfFiles(Array.from(e.target.files));
//       setIsChanged(true);
//     }
//   };

//   // For image, only one file is allowed.
//   const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setNewImageFile(e.target.files[0]);
//       setIsChanged(true);
//     }
//   };

//   // Convert file to a base64 string (without the data URL prefix).
//   const fileToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         const result = reader.result as string;
//         resolve(result.split(',')[1]);
//       };
//       reader.onerror = error => reject(error);
//     });
//   };

//   // Handle PDF item click to preview content in a modal.
//   const handlePdfItemClick = async (item: PdfItem) => {
//     if (item.isNew && item.file) {
//       const base64 = await fileToBase64(item.file);
//       setSelectedPdf({ name: item.name, dataUrl: `data:application/pdf;base64,${base64}` });
//     } else if (item.dataUrl) {
//       setSelectedPdf({ name: item.name, dataUrl: item.dataUrl });
//     }
//   };

//   // const handleSaveChanges = async () => {
//   //   // Final check only for newly entered additional URL.
//   //   if (containsForbiddenDomain(additionalUrl)) {
//   //     toast.error("currently x and twitter links cannot be added to knowledgebase in edit option");
//   //     return;
//   //   }
//   //   setLoading(true);
//   //   try {
//   //     // Convert new PDF files to base64 strings.
//   //     let pdfBase64Files: string[] = [];
//   //     if (newPdfFiles.length > 0) {
//   //       pdfBase64Files = await Promise.all(
//   //         newPdfFiles.map((file) => fileToBase64(file))
//   //       );
//   //     }

//   //     let imageBase64: string | null = null;
//   //     if (newImageFile) {
//   //       imageBase64 = await fileToBase64(newImageFile);
//   //     }

//   //     // Prepare URL payload. For primary URL, use it as is (even if locked).
//   //     const urls = [url.trim()];
//   //     if (additionalUrl.trim()) {
//   //       urls.push(additionalUrl.trim());
//   //     }

//   //     // Prepare the unified payload.
//   //     const payload = {
//   //       user_id,
//   //       pdf_files: pdfBase64Files,
//   //       image_file: imageBase64,
//   //       urls, // now an array (max 2 URLs)
//   //     };

//   //     const res = await fetch(`/api/update_agent`, {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify(payload),
//   //     });

//   //     if (!res.ok) {
//   //       throw new Error('Failed to update knowledgebase');
//   //     }

//   //     await res.json();
//   //     toast.success('Knowledgebase updated for agent successfully');
//   //     setLoading(false);
//   //     router.push('/');
//   //   } catch (error: any) {
//   //     setLoading(false);
//   //     toast.error(error.message || 'An error occurred');
//   //   }
//   // };

//   const handleSaveChanges = async () => {
//     // Check the additional URL for forbidden domains
//     if (containsForbiddenDomain(additionalUrl)) {
//       toast.error("currently x and twitter links cannot be added to knowledgebase in edit option");
//       return;
//     }
//     setLoading(true);
//     try {
//       // Process new PDF files: convert to base64 if available, else send null.
//       let pdfBase64Files: string[] = [];
//       if (newPdfFiles.length > 0) {
//         pdfBase64Files = await Promise.all(
//           newPdfFiles.map((file) => fileToBase64(file))
//         );
//       }

//       // Process new image: convert to base64 if uploaded, otherwise remains null.
//       let imageBase64: string | null = null;
//       if (newImageFile) {
//         imageBase64 = await fileToBase64(newImageFile);
//       }

//       // Process URLs: Only if the primary URL is changed or an additional URL is provided.
//       let urls: string[] = [];
//       if (url.trim() !== (initialUrls[0] || '')) {
//         urls.push(url.trim());
//       }
//       if (additionalUrl.trim()) {
//         urls.push(additionalUrl.trim());
//       }

//       // Build the payload, sending null for image_file or urls if no new data was provided.
//       const payload = {
//         user_id,
//         pdf_files: pdfBase64Files.length > 0 ? pdfBase64Files : null,
//         image_file: imageBase64, // Will be null if no new image uploaded.
//         urls: urls.length > 0 ? urls : null, // Will be null if no new URL is added.
//       };

//       const res = await fetch(`/api/update_agent`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const result = await res.json();

//       if (result.success) {
//         const results = result.results;
//         let allSuccess = true;
//         let errorMsg = "";

//         if (results.pdf && !results.pdf.success) {
//           allSuccess = false;
//           errorMsg += results.pdf.error + " ";
//         }

//         if (results.image && !results.image.success) {
//           allSuccess = false;
//           errorMsg += results.image.error + " ";
//         }

//         if (results.url && !results.url.success) {
//           allSuccess = false;
//           errorMsg += results.url.error + " ";
//         }

//         if (!allSuccess) {
//           toast.error(errorMsg.trim());
//           setLoading(false);
//           return;
//         }

//         toast.success('Knowledgebase updated for agent successfully');
//         setLoading(false);
//         router.push('/');
//       } else {
//         toast.error('Update failed');
//         setLoading(false);
//       }
//     } catch (error: any) {
//       setLoading(false);
//       toast.error(error.message || 'An error occurred');
//     }
//   };


//   // Create a combined list of PDF items from mapped (existing) PDFs and new uploads.
//   const initialPdfItems: PdfItem[] = pdfs.map((pdf, idx) => ({
//     name: `PDF ${idx + 1}`,
//     dataUrl: pdf,
//     isNew: false,
//   }));
//   const newPdfItems: PdfItem[] = newPdfFiles.map(file => ({
//     name: file.name,
//     file,
//     isNew: true,
//   }));
//   const allPdfItems: PdfItem[] = [...initialPdfItems, ...newPdfItems];

//   // Cleanup object URL when newImageFile changes.
//   const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
//   useEffect(() => {
//     if (newImageFile) {
//       const url = URL.createObjectURL(newImageFile);
//       setNewImageUrl(url);
//       return () => URL.revokeObjectURL(url);
//     } else {
//       setNewImageUrl(null);
//     }
//   }, [newImageFile]);

//   return (
//     <main style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
//       <h1>Edit Agent Data</h1>
//       {newImageUrl ? (
//         <div style={{ margin: '1rem 0' }}>
//           <img
//             src={newImageUrl}
//             alt={`Uploaded image for ${ticker}`}
//             style={{ maxWidth: '100%', borderRadius: 8 }}
//           />
//         </div>
//       ) : image_base64 || image ? (
//         <div style={{ margin: '1rem 0' }}>
//           <img
//             src={image ? `data:image/png;base64,${image}` : `data:image/png;base64,${image_base64}`}
//             alt={`Agent for ${ticker}`}
//             style={{ maxWidth: '100%', borderRadius: 8 }}
//           />
//         </div>
//       ) : (
//         <p>No image available</p>
//       )}
//       <h2
//         style={{
//           background: '#343B4F',
//           padding: '1rem',
//           borderRadius: 8,
//           marginBottom: '1rem',
//           color: '#fff',
//         }}
//       >
//         {ticker}
//       </h2>
//       <section
//         style={{
//           background: '#222',
//           padding: '1rem',
//           borderRadius: 8,
//           marginBottom: '1rem',
//         }}
//       >
//         <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>Description</h3>
//         <div style={{ whiteSpace: 'pre-wrap', color: '#ccc' }}>
//           {description ?? 'No description found.'}
//         </div>
//       </section>
//       <section style={{ background: '#222', padding: '1rem', borderRadius: 8 }}>
//         <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Training Data</h3>
//         {/* URL section */}
//         <div
//           style={{
//             background: '#333',
//             padding: '0.75rem',
//             borderRadius: 6,
//             marginBottom: '1rem',
//           }}
//         >
//           <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>URL</h4>
//           <div style={{ marginTop: '0.5rem' }}>
//             <input
//               type="text"
//               placeholder="Enter primary URL"
//               value={url}
//               onChange={handleUrlChange}
//               disabled={primaryUrlLocked}
//               style={{ width: '100%', padding: '0.5rem' }}
//             />
//             {primaryUrlLocked && (
//               <small style={{ color: '#aaa' }}>
//                 Editing disabled for pre-existing forbidden URL.
//               </small>
//             )}
//           </div>
//           {/* Show additional URL input only if a primary URL exists */}
//           {url && (
//             <div style={{ marginTop: '0.5rem' }}>
//               <input
//                 type="text"
//                 placeholder="Enter additional URL"
//                 value={additionalUrl}
//                 onChange={handleAdditionalUrlChange}
//                 style={{ width: '100%', padding: '0.5rem' }}
//               />
//             </div>
//           )}
//         </div>
//         {/* PDF section */}
//         <div
//           style={{
//             background: '#333',
//             padding: '0.75rem',
//             borderRadius: 6,
//             marginBottom: '1rem',
//           }}
//         >
//           <h4
//             style={{
//               color: '#fff',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//             }}
//           >
//             PDFs
//             <label style={{ cursor: 'pointer', color: '#57b3ff' }}>
//               +
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 multiple
//                 onChange={handlePdfChange}
//                 style={{ display: 'none' }}
//               />
//             </label>
//           </h4>
//           {allPdfItems.length > 0 ? (
//             <ul style={{ marginLeft: '1rem' }}>
//               {allPdfItems.map((item, idx) => (
//                 <li
//                   key={idx}
//                   onClick={() => handlePdfItemClick(item)}
//                   style={{
//                     margin: '0.5rem 0',
//                     display: 'flex',
//                     alignItems: 'center',
//                     cursor: 'pointer',
//                   }}
//                 >
//                   <span style={{ marginRight: '0.5rem' }}>📄</span>
//                   {item.name}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p style={{ color: '#ccc' }}>No data</p>
//           )}
//         </div>
//         {/* Image section */}
//         <div
//           style={{
//             background: '#333',
//             padding: '0.75rem',
//             borderRadius: 6,
//           }}
//         >
//           <h4
//             style={{
//               color: '#fff',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//             }}
//           >
//             Image
//             {/** Only show the upload label if no new image is selected */}
//             {!newImageFile ? (
//               <label style={{ cursor: 'pointer', color: '#57b3ff' }}>
//                 +
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   style={{ display: 'none' }}
//                 />
//               </label>
//             ) : (
//               <span style={{ color: '#aaa', cursor: 'not-allowed' }}>+</span>
//             )}
//           </h4>
//           <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
//             {(image || image_base64) && (
//               <img
//                 src={image ? `data:image/png;base64,${image}` : `data:image/png;base64,${image_base64}`}
//                 alt="Existing image"
//                 style={{ maxWidth: newImageUrl ? '50%' : '100%', borderRadius: 8 }}
//               />
//             )}
//             {newImageUrl && (
//               <img
//                 src={newImageUrl}
//                 alt="New uploaded image"
//                 style={{ maxWidth: '50%', borderRadius: 8 }}
//               />
//             )}
//           </div>
//           {!(image || image_base64) && !newImageUrl && (
//             <p style={{ color: '#ccc' }}>No data</p>
//           )}
//         </div>

//         {/* <div
//           style={{
//             background: '#333',
//             padding: '0.75rem',
//             borderRadius: 6,
//           }}
//         >
//           <h4
//             style={{
//               color: '#fff',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//             }}
//           >
//             Image
//             <label style={{ cursor: 'pointer', color: '#57b3ff' }}>
//               +
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//                 style={{ display: 'none' }}
//               />
//             </label>
//           </h4>
//           {newImageUrl ? (
//             <div style={{ marginTop: '0.5rem' }}>
//               <img
//                 src={newImageUrl}
//                 alt="New uploaded image"
//                 style={{ maxWidth: '100%', borderRadius: 8 }}
//               />
//             </div>
//           ) : image || image_base64 ? (
//             <div style={{ marginTop: '0.5rem' }}>
//               <img
//                 src={image ? `data:image/png;base64,${image}` : `data:image/png;base64,${image_base64}`}
//                 alt="training image"
//                 style={{ maxWidth: '100%', borderRadius: 8 }}
//               />
//             </div>
//           ) : (
//             <p style={{ color: '#ccc' }}>No data</p>
//           )}
//         </div> */}
//       </section>
//       <div style={{ marginTop: '1rem', textAlign: 'center' }}>
//         <button
//           onClick={handleSaveChanges}
//           disabled={!isChanged || loading}
//           style={{
//             padding: '0.75rem 1.5rem',
//             background: isChanged ? '#57b3ff' : '#777',
//             border: 'none',
//             borderRadius: 4,
//             cursor: isChanged ? 'pointer' : 'not-allowed',
//             color: '#fff',
//           }}
//         >
//           {loading ? 'Uploading to knowledge base...' : 'Save Changes'}
//         </button>
//       </div>
//       {/* PDF preview modal */}
//       {selectedPdf && (
//         <div
//           style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: 'rgba(0,0,0,0.5)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             zIndex: 1000,
//           }}
//         >
//           <div
//             style={{
//               background: '#fff',
//               padding: '1rem',
//               borderRadius: 8,
//               width: '80%',
//               height: '80%',
//               display: 'flex',
//               flexDirection: 'column',
//             }}
//           >
//             <h3>{selectedPdf.name}</h3>
//             <div style={{ flex: 1, overflowY: 'auto' }}>
//               <iframe
//                 src={selectedPdf.dataUrl}
//                 title={selectedPdf.name}
//                 style={{ width: '100%', height: '100%', border: 'none' }}
//               />
//               {/*
//         // Alternatively, you can try:
//         <object
//           data={selectedPdf.dataUrl}
//           type="application/pdf"
//           width="100%"
//           height="100%"
//         >
//           Your browser does not support PDFs.
//         </object>
//         */}
//             </div>
//             <button
//               onClick={() => setSelectedPdf(null)}
//               style={{
//                 marginTop: '1rem',
//                 padding: '0.5rem 1rem',
//                 cursor: 'pointer',
//                 alignSelf: 'flex-end',
//               }}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//     </main>
//   );
// }

"use client";
import React, { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';

interface EditAgentClientProps {
  ticker: string;
  dictionary: any;
  image_base64?: string;
  description?: string;
  initialUrls: string[];
  // For PDFs, we assume the initial strings are PDF content (base64) for preview.
  initialPdfs: string[];
  initialImages: string[];
}

interface PdfItem {
  name: string;
  // For existing PDFs, this is the raw data string (which might already include the prefix)
  dataUrl?: string;
  // For new PDFs, we store the file reference.
  file?: File;
  isNew: boolean;
}

export default function EditAgentClient({
  ticker,
  dictionary,
  image_base64,
  description,
  initialUrls,
  initialPdfs,
  initialImages,
}: EditAgentClientProps) {
  const router = useRouter();
  const { publicKey } = useWallet();

  const primaryUrlLocked = !!initialUrls[0] &&
    (initialUrls[0].toLowerCase().includes("twitter.com") ||
      initialUrls[0].toLowerCase().includes("x.com"));

  const [url, setUrl] = useState(initialUrls[0] || '');
  const [additionalUrl, setAdditionalUrl] = useState('');

  const [newPdfFiles, setNewPdfFiles] = useState<File[]>([]);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const [pdfs, setPdfs] = useState<string[]>(initialPdfs);
  const [image, setImage] = useState<string | null>(initialImages[0] || null);

  const [isChanged, setIsChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const user_id = publicKey ? publicKey.toString() : '';

  // selectedPdf now keeps the full PdfItem info.
  const [selectedPdf, setSelectedPdf] = useState<PdfItem | null>(null);

  const forbiddenDomains = ['twitter.com', 'x.com'];
  const containsForbiddenDomain = (input: string) =>
    forbiddenDomains.some(domain => input.toLowerCase().includes(domain));

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (primaryUrlLocked) return;
    const value = e.target.value;
    if (containsForbiddenDomain(value)) {
      toast.error("currently x and twitter links cannot be added to knowledgebase in edit option");
      return;
    }
    setUrl(value);
    setIsChanged(true);
  };

  const handleAdditionalUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (containsForbiddenDomain(value)) {
      toast.error("currently x and twitter links cannot be added to knowledgebase in edit option");
      return;
    }
    setAdditionalUrl(value);
    setIsChanged(true);
  };

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewPdfFiles(Array.from(e.target.files));
      setIsChanged(true);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImageFile(e.target.files[0]);
      setIsChanged(true);
    }
  };

  // Convert file to a base64 string (without the data URL prefix).
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Helper: If the PDF string starts with the prefix, remove it.
  const getPdfText = (data: string): string => {
    const prefix = "data:application/pdf;base64,";
    return data.startsWith(prefix) ? data.slice(prefix.length) : data;
  };

  // Handle PDF item click to preview content.
  const handlePdfItemClick = async (item: PdfItem) => {
    if (item.isNew && item.file) {
      const base64 = await fileToBase64(item.file);
      // For new uploads, we want to display the PDF using the viewer.
      setSelectedPdf({ name: item.name, dataUrl: `data:application/pdf;base64,${base64}`, isNew: true });
    } else if (item.dataUrl) {
      // For existing PDFs, just display the raw text.
      setSelectedPdf({ name: item.name, dataUrl: item.dataUrl, isNew: false });
    }
  };

  // Save changes handler remains similar...
  const handleSaveChanges = async () => {
    if (containsForbiddenDomain(additionalUrl)) {
      toast.error("currently x and twitter links cannot be added to knowledgebase in edit option");
      return;
    }
    setLoading(true);
    try {
      let pdfBase64Files: string[] = [];
      if (newPdfFiles.length > 0) {
        pdfBase64Files = await Promise.all(newPdfFiles.map(file => fileToBase64(file)));
      }
      let imageBase64: string | null = null;
      if (newImageFile) {
        imageBase64 = await fileToBase64(newImageFile);
      }
      let urls: string[] = [];
      if (url.trim() !== (initialUrls[0] || '')) {
        urls.push(url.trim());
      }
      if (additionalUrl.trim()) {
        urls.push(additionalUrl.trim());
      }
      const payload = {
        user_id,
        pdf_files: pdfBase64Files.length > 0 ? pdfBase64Files : null,
        image_file: imageBase64,
        urls: urls.length > 0 ? urls : null,
      };
      const res = await fetch(`/api/update_agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        const results = result.results;
        let allSuccess = true;
        let errorMsg = "";
        if (results.pdf && !results.pdf.success) {
          allSuccess = false;
          errorMsg += results.pdf.error + " ";
        }
        if (results.image && !results.image.success) {
          allSuccess = false;
          errorMsg += results.image.error + " ";
        }
        if (results.url && !results.url.success) {
          allSuccess = false;
          errorMsg += results.url.error + " ";
        }
        if (!allSuccess) {
          toast.error(errorMsg.trim());
          setLoading(false);
          return;
        }
        toast.success('Knowledgebase updated for agent successfully');
        setLoading(false);
        router.push('/');
      } else {
        toast.error('Update failed');
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error.message || 'An error occurred');
    }
  };

  // Combine existing PDFs and new uploads into one list.
  const initialPdfItems: PdfItem[] = pdfs.map((pdf, idx) => ({
    name: `PDF ${idx + 1}`,
    dataUrl: pdf, // existing data (which already includes the prefix if needed)
    isNew: false,
  }));
  const newPdfItems: PdfItem[] = newPdfFiles.map(file => ({
    name: file.name,
    file,
    isNew: true,
  }));
  const allPdfItems: PdfItem[] = [...initialPdfItems, ...newPdfItems];

  // For new image preview URL.
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (newImageFile) {
      const url = URL.createObjectURL(newImageFile);
      setNewImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setNewImageUrl(null);
    }
  }, [newImageFile]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#171D3D'
      }}
    >
      <main className=" text-white" style={{
        maxWidth: '800px', // or any desired width
        width: '100%',
        padding: '1rem',
        textAlign: 'left' // ensures inner content is left-aligned
      }}>
        <h1>Edit Agent Data</h1>
        {newImageUrl ? (
          <div style={{ margin: '1rem 0', textAlign: 'center' }}>
            <img
              src={newImageUrl}
              alt={`Uploaded image for ${ticker}`}
              style={{ maxWidth: '100%', borderRadius: 8 }}
            />
          </div>
        ) : image_base64 || image ? (
          <div style={{ margin: '1rem 0', textAlign: 'center' }}>
            <img
              src={image ? `data:image/png;base64,${image}` : `data:image/png;base64,${image_base64}`}
              alt={`Agent for ${ticker}`}
              style={{ maxWidth: '100%', borderRadius: 8 }}
            />
          </div>
        ) : (
          <p>No image available</p>
        )}

        <h2 style={{ background: '#343B4F', padding: '1rem', borderRadius: 8, marginBottom: '1rem', color: '#fff' }}>
          {ticker}
        </h2>
        <section style={{ background: '#343B4F', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>Description</h3>
          <div style={{ whiteSpace: 'pre-wrap', color: '#ccc' }}>
            {description ?? 'No description found.'}
          </div>
        </section>
        <section style={{ background: '#343B4F', padding: '1rem', borderRadius: 8 }}>
          {/* URL Section */}
          <div style={{ background: '#333', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem' }}>
            <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>URL</h4>
            <div style={{ marginTop: '0.5rem' }}>
              <input
                type="text"
                placeholder="Enter primary URL"
                value={url}
                onChange={handleUrlChange}
                disabled={primaryUrlLocked}
                style={{ width: '100%', padding: '0.5rem' }}
              />
              {primaryUrlLocked && <small style={{ color: '#aaa' }}>Editing disabled for pre-existing forbidden URL.</small>}
            </div>
            {url && (
              <div style={{ marginTop: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Enter additional URL"
                  value={additionalUrl}
                  onChange={handleAdditionalUrlChange}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
            )}
          </div>
          {/* PDF Section */}
          <div style={{ background: '#333', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem' }}>
            <h4 style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              PDFs
              <label style={{ cursor: 'pointer', color: '#57b3ff' }}>
                +
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handlePdfChange}
                  style={{ display: 'none' }}
                />
              </label>
            </h4>
            {allPdfItems.length > 0 ? (
              <ul style={{ marginLeft: '1rem' }}>
                {allPdfItems.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => handlePdfItemClick(item)}
                    style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <span style={{ marginRight: '0.5rem' }}>📄</span>
                    {item.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#ccc' }}>No data</p>
            )}
          </div>
          {/* Image Section */}
          <div style={{ background: '#333', padding: '0.75rem', borderRadius: 6 }}>
            <h4 style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Image
              {!newImageFile ? (
                <label style={{ cursor: 'pointer', color: '#57b3ff' }}>
                  +
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              ) : (
                <span style={{ color: '#aaa', cursor: 'not-allowed' }}>+</span>
              )}
            </h4>
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {(image || image_base64) && (
                <img
                  src={image ? `data:image/png;base64,${image}` : `data:image/png;base64,${image_base64}`}
                  alt="Existing image"
                  style={{ maxWidth: newImageUrl ? '50%' : '100%', borderRadius: 8 }}
                />
              )}
              {newImageUrl && (
                <img
                  src={newImageUrl}
                  alt="New uploaded image"
                  style={{ maxWidth: '50%', borderRadius: 8 }}
                />
              )}
            </div>

            {!(image || image_base64) && !newImageUrl && <p style={{ color: '#ccc' }}>No data</p>}
          </div>
        </section>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            onClick={handleSaveChanges}
            disabled={!isChanged || loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: isChanged ? '#57b3ff' : '#777',
              border: 'none',
              borderRadius: 4,
              cursor: isChanged ? 'pointer' : 'not-allowed',
              color: '#fff',
            }}
          >
            {loading ? 'Uploading to knowledge base...' : 'Save Changes'}
          </button>
        </div>
        {/* PDF Preview Modal */}
        {selectedPdf && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: '#fff',
                padding: '1rem',
                borderRadius: 8,
                width: '80%',
                height: '80%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3>{selectedPdf.name}</h3>
              <div style={{ flex: 1, overflowY: 'auto', background: '#eee', padding: '1rem' }}>
                {selectedPdf.isNew ? (
                  // Use PDF viewer for new uploads.
                  <iframe
                    src={selectedPdf.dataUrl}
                    title={selectedPdf.name}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  // Display raw text for existing PDFs.
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
                    {getPdfText(selectedPdf.dataUrl || '')}
                  </pre>
                )}
              </div>
              <button
                onClick={() => setSelectedPdf(null)}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  alignSelf: 'flex-end',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
