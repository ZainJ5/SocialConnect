import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Bookmark,
  Send,
  Smile,
  X
} from 'lucide-react';



const Post = ({ post, onComment, onShare, onDelete, darkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes || 0);
  const [localShares, setLocalShares] = useState(post.shares || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [showDropdown, setShowDropdown] = useState(false);
  const currentUser = localStorage.getItem("token");
  const commentInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const handleLike = async () => {
    if (isLiking || !currentUser) return;
      console.log('Current user:', currentUser);
    try {
      setIsLiking(true);
      const isCurrentlyLiked = isLiked;
  
      setLocalLikes(prev => isCurrentlyLiked ? prev - 1 : prev + 1);
      setIsLiked(!isCurrentlyLiked);
  
      const endpoint = isCurrentlyLiked ? '/api/unlike' : '/api/like';
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          postId: post.id || post.uniqueId,
          userId: currentUser,
          likedAt: new Date().toISOString()
        })
      });
  
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update like status');
        }
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(text || 'Failed to update like status');
        }
      }
  
    } catch (error) {
      console.error('Error toggling like:', error);
      setLocalLikes(prev => isLiked ? prev - 1 : prev + 1);
      setIsLiked(!isLiked);
    } finally {
      setIsLiking(false);
    }
  };

const handleComment = async () => {
  if (!newComment.trim() || isCommenting) return;
  
  try {
    setIsCommenting(true);
    
    const newCommentObj = {
      id: Date.now(), 
      userId: currentUser,
      postId: post.id || post.uniqueId,
      comment: newComment,
      commentAt: new Date().toISOString()
    };

    setComments(prevComments => [...prevComments, newCommentObj]);
    
    await onComment(post.id || post.uniqueId, newComment);
    
    setNewComment('');
  } catch (error) {
    console.error('Error adding comment:', error);
    setComments(prevComments => 
      prevComments.filter(comment => comment.id !== newCommentObj.id)
    );
  } finally {
    setIsCommenting(false);
  }
};

const handleShare = async () => {
  const shareUrl = window.location.href;
  const shareText = `${post.content}\n\nShared from: ${shareUrl}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Post by ${post.user}`,
        text: post.content,
        url: shareUrl
      });
      setLocalShares(prev => prev + 1);
      await onShare(post.id || post.uniqueId);
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
        showCustomShareModal();
      } else {
        console.error('Share failed:', error);
      }
    }
  } else {
    showCustomShareModal();
  }
};

const showCustomShareModal = () => {
  const modal = document.createElement('div');
  modal.className = `fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${
    darkMode ? 'text-white' : 'text-black'
  }`;
  
  modal.innerHTML = `
    <div class="${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-sm w-full mx-4">
      <h3 class="text-lg font-bold mb-4">Share Post</h3>
      <div class="space-y-3">
        <button class="w-full p-2 rounded bg-blue-500 text-white hover:bg-blue-600" onclick="copyLink()">
          Copy Link
        </button>
        <a href="mailto:?subject=Check this post&body=${encodeURIComponent(shareText)}" 
           class="block w-full p-2 rounded bg-gray-500 text-white hover:bg-gray-600 text-center">
          Share via Email
        </a>
        <button class="w-full p-2 rounded bg-red-500 text-white hover:bg-red-600" onclick="closeModal()">
          Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  window.copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLocalShares(prev => prev + 1);
      await onShare(post.id || post.uniqueId);
      alert('Link copied to clipboard!');
      modal.remove();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  window.closeModal = () => {
    modal.remove();
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};

  const renderMedia = () => {
    if (!post.media_urls) return null;

    if (post.media_type === 'image') {
      return (
        <div className="mt-4 max-w-full">
          <img
            src={post.media_urls}
            alt="Post content"
            className="rounded-lg w-auto max-w-full max-h-[512px] object-contain" 
            loading="lazy"
          />
        </div>
      );
    }

    if (post.media_type === 'video') {
      return (
        <div className="mt-4 max-w-full">
          <video
            className="rounded-lg w-auto max-w-full max-h-[512px]"
            controls
            preload="metadata"
            controlsList="nodownload"
            playsInline
          >
            <source src={post.media_urls} type="video/mp4" />
            Your browser doesn't support video playback.
          </video>
        </div>
      );
    }

    return null;
  };


const [comments, setComments] = useState([]);
const [isLoadingComments, setIsLoadingComments] = useState(false);
const [commentUsers, setCommentUsers] = useState({});

const fetchUserInfo = async (email) => {
  try {
    const response = await fetch(`http://localhost:3000/api/user/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const userData = await response.json();
    return userData;
    
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};

const fetchComments = async () => {
  setIsLoadingComments(true);
  try {
    const response = await fetch('http://localhost:3000/api/allcomments');
    const commentsData = await response.json();
    console.log('Comments:', commentsData);
    
    const postComments = commentsData.filter(
      comment => comment.postId === (post.postId || post.uniqueId)
    );
    
    const uniqueUserEmails = [...new Set(postComments.map(comment => comment.user_id))];
    
    const userPromises = uniqueUserEmails.map(email => fetchUserInfo(email));
    const users = await Promise.all(userPromises);
    
    const userMap = uniqueUserEmails.reduce((acc, email, index) => {
      if (users[index]) {
        acc[email] = users[index];
      }
      return acc;
    }, {});
    
    setCommentUsers(userMap);
    setComments(postComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
  } finally {
    setIsLoadingComments(false);
  }
};

useEffect(() => {
  if (showComments) {
    fetchComments();
  }
}, [showComments]);


useEffect(() => {
  const handleClickOutside = (event) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
      setShowEmojiPicker(false);
    }
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

const onEmojiClick = (emojiObject) => {
  setNewComment(prevComment => prevComment + emojiObject.emoji);
  setShowEmojiPicker(false);
};

return (
  <article className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow-md overflow-hidden`}>
    {/* Header */}
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img
          src={post.avatar || '/default-avatar.png'}
          alt={post.user_id}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{post.user_id || 'Anonymous'}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {new Date(post.timestamp).toLocaleString()}
          </p>
          {post.location !=='noLocation' &&(
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {post.location}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`p-2 rounded-full transition-colors ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {showDropdown && (
          <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
            darkMode ? 'bg-gray-700' : 'bg-white'
          } ring-1 ring-black ring-opacity-5 z-10`}>
            <div className="py-1">
              <button
                onClick={() => {
                  setIsBookmarked(!isBookmarked);
                  setShowDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                {isBookmarked ? 'Remove Bookmark' : 'Bookmark Post'}
              </button>
              {post.user_id === currentUser && (
                <button
                  onClick={() => {
                    onDelete(post.id || post.uniqueId);
                    setShowDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${
                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                  }`}
                >
                  Delete Post
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Content */}
    <div className="px-4 space-y-4">
      {post.content && (
        <p className="whitespace-pre-wrap break-words">{post.content}</p>
      )}
      {renderMedia()}
    </div>

    {/* Actions */}
    <div className={`mt-4 px-4 py-3 flex items-center justify-between border-t ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex items-center space-x-6">
        <button
          onClick={handleLike}
          disabled={isLiking || !currentUser}
          className={`flex items-center space-x-2 transition-colors ${
            isLiked ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-600'
          } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart 
            className={`w-5 h-5 ${isLiked ? 'fill-current' : ''} ${
              isLiking ? 'animate-pulse' : ''
            }`} 
          />
          <span>{localLikes}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center space-x-2 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments}</span>
        </button>

        <button
          onClick={handleShare}
          className={`flex items-center space-x-2 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <Share2 className="w-5 h-5" />
          <span>{localShares}</span>
        </button>
      </div>

      <button
        onClick={() => setIsBookmarked(!isBookmarked)}
        className={`p-2 rounded-full transition-colors ${
          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
        }`}
      >
        <Bookmark className={`w-5 h-5 ${
          isBookmarked ? 'fill-current text-blue-500' : ''
        }`} />
      </button>
    </div>

      {/* Comments Section */}
  {showComments && (
    <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Single Comment Preview */}
      <div className="px-4 py-2">
        {isLoadingComments ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : comments.length > 0 ? (
          <>
            <div className={`py-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
              <div className="flex items-start space-x-3">
              <img
                  src={commentUsers[comments[0].user_id]?.avatar || 'https://api.dicebear.com/6.x/avataaars/svg?seed=defaultSeed&radius=50'}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {commentUsers[comments[0].user_id]?.name || 'Unknown User'}
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(comments[0].commentAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {comments[0].comment}
                  </p>
                </div>
              </div>
            </div>
            {comments.length > 1 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className={`w-full text-center py-2 text-sm font-medium ${
                  darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                View all {comments.length} comments
              </button>
            )}
          </>
        ) : (
          <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

    {/* Comment Input */}
    <div className="p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <input
            ref={commentInputRef}
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            className={`w-full px-4 py-2 pr-12 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? 'bg-gray-700 text-white placeholder-gray-400'
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Smile className="w-5 h-5 text-gray-400" />
          </button>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute right-0 bottom-12 z-50"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                searchDisabled
                skinTonesDisabled
                width={280}
                height={350}
                theme={darkMode ? 'dark' : 'light'}
                previewConfig={{
                  showPreview: false
                }}
              />
            </div>
          )}
        </div>
        
        <button
          onClick={handleComment}
          disabled={isCommenting || !newComment.trim()}
          className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>

      {/* Comments Modal */}
      <CommentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        comments={comments}
        commentUsers={commentUsers}
        darkMode={darkMode}
        isLoadingComments={isLoadingComments}
      />
    </div>
  )}
    </article>
  );
};

export default Post;



const CommentsModal = ({ isOpen, onClose, comments, commentUsers, darkMode, isLoadingComments }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`relative w-full max-w-2xl max-h-[90vh] rounded-lg shadow-lg ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Comments</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 8rem)' }}>
          {isLoadingComments ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`py-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b last:border-0`}
              >
                <div className="flex items-start space-x-3">
                <img
  src={commentUsers[comments[0].user_id]?.avatar || `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(comments.commentAt)}&radius=50`}
  alt="User avatar"
  className="w-8 h-8 rounded-full object-cover"
/>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {commentUsers[comment.user_id]?.name || 'Unknown User'}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(comment.commentAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {comment.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
