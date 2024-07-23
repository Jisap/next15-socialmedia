import prisma from "@/lib/client";
import Image from "next/image";
import CommentList from "./CommentList";

const Comments = async ({ postId }: { postId: number }) => {

  const comments = await prisma.comment.findMany({    // Comentarios que tiene el post, conteniendo el usuario que los creo
    where: {
      postId,
    },
    include: {
      user: true
    }
  })
  return (
    <div className="">
      {/* WRITE */}
      <CommentList 
        comments={comments} // Comentarios del post
        postId={postId}     // id del post  
      />
    </div>
  );
};

export default Comments;