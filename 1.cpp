#include <iostream>
#include <fstream>
#include <string>
#include <cstdlib>
using namespace std;

struct Post {
    string postID, userID, postType, postContent, postURL, postDate, postLocation;
    int likes, comments, shares;
    double trendingScore;
};

double calculateTrendingScore(int likes, int comments, int shares) {
    return likes * 0.6 + comments * 0.3 + shares * 0.1;
}

int stringToInt(const string &str) {
    return stoi(str);
}

bool parsePost(ifstream &file, Post &post) {
    string likes, comments, shares;

    if (getline(file, post.postID) &&
        getline(file, post.userID) &&
        getline(file, post.postType) &&
        getline(file, post.postContent) &&
        getline(file, post.postURL) &&
        getline(file, post.postDate) &&
        getline(file, post.postLocation) &&
        getline(file, likes) &&
        getline(file, comments) &&
        getline(file, shares)) {

        cout << "DEBUG: Raw data read from file:" << endl;
        cout << "Post ID: " << post.postID << endl;
        cout << "User ID: " << post.userID << endl;
        cout << "Post Type: " << post.postType << endl;
        cout << "Post Content: " << post.postContent << endl;
        cout << "Post URL: " << post.postURL << endl;
        cout << "Post Date: " << post.postDate << endl;
        cout << "Post Location: " << post.postLocation << endl;
        cout << "Likes: " << likes << ", Comments: " << comments << ", Shares: " << shares << endl;

        post.likes = stringToInt(likes);
        post.comments = stringToInt(comments);
        post.shares = stringToInt(shares);
        post.trendingScore = calculateTrendingScore(post.likes, post.comments, post.shares);

        return true;
    }

    return false;
}

int readPostsFromFile(const string &filename, Post posts[], int maxPosts) {
    ifstream file(filename);
    int count = 0;

    if (!file) {
        cerr << "Error opening file." << endl;
        return 0;
    }

    while (count < maxPosts) {
        if (!parsePost(file, posts[count])) {
            break; // End of file or parse error
        }
        count++;
        cout << "Post " << count << " read successfully." << endl;  // Debug output
    }

    file.close();
    return count;
}

void merge(Post posts[], int left, int mid, int right) {
    int n1 = mid - left + 1, n2 = right - mid;
    Post leftArray[n1], rightArray[n2];

    for (int i = 0; i < n1; i++) leftArray[i] = posts[left + i];
    for (int i = 0; i < n2; i++) rightArray[i] = posts[mid + 1 + i];

    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (leftArray[i].trendingScore >= rightArray[j].trendingScore)
            posts[k++] = leftArray[i++];
        else
            posts[k++] = rightArray[j++];
    }

    while (i < n1) posts[k++] = leftArray[i++];
    while (j < n2) posts[k++] = rightArray[j++];
}

void mergeSort(Post posts[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(posts, left, mid);
        mergeSort(posts, mid + 1, right);
        merge(posts, left, mid, right);
    }
}

void displayPosts(Post posts[], int n) {
    for (int i = 0; i < n; i++) {
        cout << "Post ID: " << posts[i].postID << "\nUser ID: " << posts[i].userID 
             << "\nPost Type: " << posts[i].postType << "\nContent: " << posts[i].postContent 
             << "\nURL: " << posts[i].postURL << "\nDate: " << posts[i].postDate 
             << "\nLocation: " << posts[i].postLocation << "\nLikes: " << posts[i].likes 
             << ", Comments: " << posts[i].comments << ", Shares: " << posts[i].shares 
             << "\nTrending Score: " << posts[i].trendingScore << endl;
    }
}

int main() {
    const int MAX_POSTS = 100;
    Post posts[MAX_POSTS];
    string filename = "posts.txt";

    int postCount = readPostsFromFile(filename, posts, MAX_POSTS);
    mergeSort(posts, 0, postCount - 1);

    cout << "Trending Posts:" << endl;
    displayPosts(posts, postCount);

    return 0;
}
