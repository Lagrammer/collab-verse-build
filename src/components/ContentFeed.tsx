
import React from 'react';
import { Search, Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';

interface StoryProps {
  username: string;
  avatar: string;
}

const Story: React.FC<StoryProps> = ({ username, avatar }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="story-avatar">
        <img
          src={avatar}
          alt={username}
          className="h-14 w-14 rounded-full object-cover"
        />
      </div>
      <span className="text-xs text-muted-foreground">{username}</span>
    </div>
  );
};

interface PostProps {
  username: string;
  avatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

const Post: React.FC<PostProps> = ({
  username,
  avatar,
  time,
  content,
  image,
  likes,
  comments,
}) => {
  return (
    <div className="bg-card rounded-xl overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
          <img
            src={avatar}
            alt={username}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="font-medium">{username}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <p>{content}</p>
      </div>

      {image && (
        <div className="w-full">
          <img
            src={image}
            alt="Post content"
            className="w-full object-cover"
          />
        </div>
      )}

      <div className="p-4 border-t border-border">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <Heart size={18} />
              <span className="text-sm">{likes}</span>
            </button>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <MessageSquare size={18} />
              <span className="text-sm">{comments}</span>
            </button>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <Share2 size={18} />
            </button>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <Bookmark size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ContentFeed: React.FC = () => {
  return (
    <div className="flex-1 h-screen overflow-y-auto py-4 px-6">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-2/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search for creators, inspiration and projects"
            className="w-full py-2.5 pl-10 pr-4 bg-secondary rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-brand-yellow"
          />
        </div>
        <button className="py-2.5 px-6 bg-brand-yellow text-black rounded-full font-medium hover:bg-brand-yellow/90">
          Contribute
        </button>
      </div>

      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-4">
          <Story username="mark_design" avatar="https://i.pravatar.cc/100?img=12" />
          <Story username="creative_hub" avatar="https://i.pravatar.cc/100?img=22" />
          <Story username="tech_artistry" avatar="https://i.pravatar.cc/100?img=32" />
          <Story username="digital_crafts" avatar="https://i.pravatar.cc/100?img=42" />
          <Story username="3d_masters" avatar="https://i.pravatar.cc/100?img=52" />
          <Story username="ux_paradigm" avatar="https://i.pravatar.cc/100?img=62" />
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-card rounded-xl p-4 flex gap-3 items-center">
          <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
            <img
              src="https://i.pravatar.cc/100?img=33"
              alt="Your avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <input
            type="text"
            placeholder="What's on your mind, Brian?"
            className="flex-1 bg-transparent focus:outline-none"
          />
          <button className="py-2 px-4 bg-brand-yellow text-black rounded-lg font-medium text-sm hover:bg-brand-yellow/90">
            Post
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <Post
          username="Dennis Muil"
          avatar="https://i.pravatar.cc/100?img=50"
          time="15 minutes ago"
          content="Need help in aligning the joints"
          image="/lovable-uploads/3eede356-1138-48d1-bc3f-a039bc315735.png"
          likes={24}
          comments={5}
        />
        
        <Post
          username="Olivia Chen"
          avatar="https://i.pravatar.cc/100?img=25"
          time="2 hours ago"
          content="Just finished my latest UX design concept for a creative workflow app. Looking for feedback from fellow designers! The project aims to streamline collaborative processes for remote teams."
          likes={42}
          comments={12}
        />

        <Post
          username="Marcus Wright"
          avatar="https://i.pravatar.cc/100?img=60"
          time="Yesterday"
          content="Working on a new algorithmic art generator using TensorFlow. Here's a preview of what it can create with minimal input parameters."
          image="https://i.pravatar.cc/600?img=17"
          likes={87}
          comments={23}
        />
      </div>
    </div>
  );
};

export default ContentFeed;
