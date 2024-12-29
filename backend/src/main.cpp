#include <iostream>
#include <fstream>
#include <string>
#include <filesystem>
#include <chrono>
#include <unordered_map>
#include <iomanip>
#include "crow_all.h"

using namespace std;
namespace fs = std::filesystem;

class User {
private:
    string currentName;
    int currentAge;

    void ensureDataDirectory() {
        if (!fs::exists("data")) {
            fs::create_directory("data");
        }
    }
public:
    User(){
        ensureDataDirectory();
    }
    void registration(const string& file, const string& name, int age, const string& email, const string& password, int recoveryKey) {
    ofstream userdata(file, ios::app);
    if (userdata.is_open()) {
        userdata << name << endl;
        userdata << age << endl;
        userdata << email << endl;
        userdata << password << endl;
        userdata << recoveryKey << endl;
        currentName = name;
        currentAge = age;
    } else {
        throw runtime_error("Error while registering: Unable to open file.");
    }
}


bool login(const string& file, const string& email, const string& password) {
    ifstream readfile(file);
    string checkemail, checkpassword;
    bool checkU = false;
    bool checkP = false;

    if (!readfile.is_open()) {
        cout << "Unable to open the file!" << endl;
        return false;
    }

    int line_number = 0;
    while (getline(readfile, checkemail)) {
        if (checkemail == email) {
            checkU = true;

            if (getline(readfile, checkpassword)) {
                if (checkpassword == password) {
                    checkP = true;
                }
            }
            break;
        }
        line_number++;
    }

    if (checkU && checkP) {
        cout << "Login Successful!!" << endl;
        return true;
    } else if (!checkU) {
        cout << "User Not Found!!" << endl;
    } else {
        cout << "Invalid Password!!" << endl;
    }

    return false;
}

bool forgotpassword(const string& file, const string& tempfile, const string& lemail, int rpin, const string& newPassword) {
    ifstream userdata(file);
    ofstream temp(tempfile);

    if (!userdata.is_open() || !temp.is_open()) {
        throw runtime_error("Error accessing user data or temporary file.");
    }
    cout << "Yaha tak bhi agay function may " << endl;

    string Srpin = to_string(rpin);
    ifstream readfile(file);
    string checkusername, checkpassword;
    bool checkU = false, checkP = false;
    int recoverykey = 0;

    while (getline(readfile, checkusername)) {
        if (lemail == checkusername) {
            checkU = true;
            break;
        }
        recoverykey++;
    }

    readfile.clear();
    readfile.seekg(0, ios::beg);
    recoverykey = recoverykey + 2;

    for (int i = 0; i <= recoverykey; i++) {
        getline(readfile, checkpassword);
        if (i == recoverykey) {
            if (Srpin == checkpassword) {
                checkP = true;
                break;
            }
        }
    }

    readfile.clear();
    readfile.seekg(0, ios::beg);

    if (!checkU) {
        cout << "No User Found" << endl;
        return false;
    }
    if (!checkP) {
        cout << "Recovery Key Invalid!" << endl;
        return false;
    }

    if (checkU && checkP) {
        int cline = 0;
        string line;
        while (getline(readfile, line)) {
            cline++;
            if (cline == recoverykey) {
                temp << newPassword << endl;
            } else {
                temp << line << endl;
            }
        }
        cout << "Password Successfully Changed!!" << endl;
    }

    readfile.close();
    temp.close();

    const char *ofile = file.c_str();
    const char *tfile = tempfile.c_str();
    remove(ofile);
    rename(tfile, ofile);

    return true;
}


    string getname() const {
        return currentName;
    }

    int getage() const {
        return currentAge;
    }

crow::json::wvalue findUserByEmail(const string& searchEmail) {
        crow::json::wvalue result;
        ifstream file("data/users.txt");
        string line;
        
        if (!file.is_open()) {
            result["error"] = "Error opening file!";
            return result;
        }

        while (getline(file, line)) {  
            string name = line;
            
            getline(file, line);  
            int age = stoi(line);
            
            getline(file, line);  
            string email = line;
            
            getline(file, line);  
            string password = line;
            
            getline(file, line);  
            string recovery = line;

            if (email == searchEmail) {
                result["name"] = name;
                result["age"] = age;
                result["email"] = email;
                result["password"] = password;
                result["recovery"] = recovery;
                file.close();
                                return result;
            }
        }

        file.close();
        result["error"] = "User not found";
        return result;
    }

private:
    void resetCurrentUser() {
        currentName = "";
        currentAge = 0;
    }
};



struct Post {
    string uniqueId;
    string user_id;
    string post_type;
    string content;
    string media_type;
    string media_urls;
    string timestamp;
    string location;
    int likes;
    int comments;
    int shares;
    Post* next;
};

struct Like {
    string postId;
    string userId;
    string likedAt;
    Like* next;
};

struct Comment {
    string postId;
    string userId;
    string comment;
    string commentAt;
    Comment* next;
};

class PostHandler {
private:
    const string posts_file = "data/posts.txt";
    const string likes_file = "data/likes.txt";
    const string comments_file = "data/comments.txt";

    Post* posts_head = nullptr;
    Like* likes_head = nullptr;
    Comment* comments_head = nullptr;

    double calculateTrendingScore(int likes, int comments, int shares) {
        return likes * 0.6 + comments * 0.3 + shares * 0.1;
    }

    int getPostsArray(Post* arr[], int maxPosts) {
        int count = 0;
        Post* current = posts_head;
        while (current && count < maxPosts) {
            arr[count++] = current;
            current = current->next;
        }
        return count;
    }

    // Umer ka Part
    void merge(Post* arr[], int left, int mid, int right) {
        int n1 = mid - left + 1;
        int n2 = right - mid;
        
        vector<Post*> leftArray(n1);
        vector<Post*> rightArray(n2);

        for (int i = 0; i < n1; i++)
            leftArray[i] = arr[left + i];
        for (int i = 0; i < n2; i++)
            rightArray[i] = arr[mid + 1 + i];

        int i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
            double score1 = calculateTrendingScore(leftArray[i]->likes, 
                                                 leftArray[i]->comments, 
                                                 leftArray[i]->shares);
            double score2 = calculateTrendingScore(rightArray[j]->likes, 
                                                 rightArray[j]->comments, 
                                                 rightArray[j]->shares);
            
            if (score1 >= score2)
                arr[k++] = leftArray[i++];
            else
                arr[k++] = rightArray[j++];
        }

        while (i < n1)
            arr[k++] = leftArray[i++];
        while (j < n2)
            arr[k++] = rightArray[j++];
    }

    // Merge sort implementation
    void mergeSort(Post* arr[], int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSort(arr, left, mid);
            mergeSort(arr, mid + 1, right);
            merge(arr, left, mid, right);
        }
    }
    
    // Yaha Tak

    void ensureDataDirectory() {
        if (!fs::exists("data")) {
            fs::create_directory("data");
        }
    }

    string getStringOrDefault(const crow::json::rvalue& json, const string& key, const string& defaultValue = "") {
        try {
            if (json.has(key)) {
                return json[key].s();
            }
        } catch (...) {}
        return defaultValue;
    }

    void loadPosts() {
        ifstream file(posts_file);
        if (!file.is_open()) return;

        string line;
        while (getline(file, line)) {
            Post* new_post = new Post();
            new_post->uniqueId = line;
            getline(file, new_post->user_id);
            getline(file, new_post->post_type);
            getline(file, new_post->content);
            getline(file, new_post->media_type);
            getline(file, new_post->media_urls);
            getline(file, new_post->timestamp);
            getline(file, new_post->location);
            file >> new_post->likes;
            file >> new_post->comments;
            file >> new_post->shares;
            file.ignore(); 
            new_post->next = posts_head;
            posts_head = new_post;
        }
        file.close();
    }

    void savePosts() {
    ofstream file(posts_file); 
    Post* current = posts_head;
    while (current) {
        cout << "Saving post: " << current->uniqueId << endl;
        file << current->uniqueId << endl;
        file << current->user_id << endl;
        file << current->post_type << endl;
        file << current->content << endl;
        file << current->media_type << endl;
        file << current->media_urls << endl;
        file << current->timestamp << endl;
        file << current->location << endl;
        file << current->likes << endl;
        file << current->comments << endl;
        file << current->shares << endl;
        current = current->next;
    }
    file.close();
}


    void loadLikes() {
        ifstream file(likes_file);
        if (!file.is_open()) return;

        string line;
        while (getline(file, line)) {
            Like* new_like = new Like();
            new_like->postId = line;
            getline(file, new_like->userId);
            getline(file, new_like->likedAt);
            new_like->next = likes_head;
            likes_head = new_like;
        }
        file.close();
    }

void saveLikes() {
    ofstream file(likes_file); 
    Like* current = likes_head;
    while (current) {
        file << current->postId << endl;
        file << current->userId << endl;
        file << current->likedAt << endl;
        current = current->next;
    }
    file.close();
}


    void loadComments() {
        ifstream file(comments_file);
        if (!file.is_open()) return;

        string line;
        while (getline(file, line)) {
            Comment* new_comment = new Comment();
            new_comment->postId = line;
            getline(file, new_comment->userId);
            getline(file, new_comment->comment);
            getline(file, new_comment->commentAt);
            new_comment->next = comments_head;
            comments_head = new_comment;
        }
        file.close();
    }

    void saveComments() {
    ofstream file(comments_file); 
    Comment* current = comments_head;
    while (current) {
        file << current->postId << endl;
        file << current->userId << endl;
        file << current->comment << endl;
        file << current->commentAt << endl;
        current = current->next;
    }
    file.close();
}


public:
    PostHandler() {
        ensureDataDirectory();
        loadPosts();
        loadLikes();
        loadComments();
    }

    ~PostHandler() {
        savePosts();
        saveLikes();
        saveComments();
        while (posts_head) {
            Post* temp = posts_head;
            posts_head = posts_head->next;
            delete temp;
        }
        while (likes_head) {
            Like* temp = likes_head;
            likes_head = likes_head->next;
            delete temp;
        }
        while (comments_head) {
            Comment* temp = comments_head;
            comments_head = comments_head->next;
            delete temp;
        }
    }

    crow::response createPost(const crow::request& req) {
        try {
            auto json = crow::json::load(req.body);
            if (!json) {
                return crow::response(400, "Invalid JSON");
            }

            if (!json.has("content") || !json.has("uniqueId")) {
                return crow::response(400, "Missing required fields");
            }

            Post* new_post = new Post();
            new_post->uniqueId = getStringOrDefault(json, "uniqueId");
            new_post->user_id = getStringOrDefault(json, "user_.id", "unknown");
            new_post->post_type = "text";
            if (json.has("media")) {
                try {
                    string media_type = json["media"]["type"].s();
                    if (media_type == "image") new_post->post_type = "image";
                    else if (media_type == "video") new_post->post_type = "video";
                    else new_post->post_type = "mixed";
                } catch (...) {}
            }
            new_post->content = getStringOrDefault(json, "content");
            new_post->media_type = "none";
            new_post->media_urls = "";
            if (json.has("media")) {
                try {
                    new_post->media_type = getStringOrDefault(json["media"], "type", "none");
                    new_post->media_urls = getStringOrDefault(json["media"], "url", "");
                } catch (...) {}
            }
            new_post->timestamp = getStringOrDefault(json, "timestamp");
            new_post->location = getStringOrDefault(json, "location", "noLocation");
            new_post->likes = 0;
            new_post->comments = 0;
            new_post->shares = 0;
            new_post->next = posts_head;
            posts_head = new_post;

            crow::json::wvalue response;
            response["uniqueId"] = new_post->uniqueId;
            response["content"] = new_post->content;
            response["timestamp"] = new_post->timestamp;

            return crow::response(201, response);
        } catch (const exception& e) {
            return crow::response(500, string("Server error: ") + e.what());
        }
    }

    crow::response getAllPosts() {
        try {
            crow::json::wvalue response(crow::json::type::List);
            Post* current = posts_head;

            while (current) {
                crow::json::wvalue current_post(crow::json::type::Object);
                current_post["uniqueId"] = current->uniqueId;
                current_post["user_id"] = current->user_id;
                current_post["post_type"] = current->post_type;
                current_post["content"] = current->content;
                current_post["media_type"] = current->media_type;
                current_post["media_urls"] = current->media_urls;
                current_post["timestamp"] = current->timestamp;
                current_post["location"] = current->location;
                current_post["likes"] = current->likes;
                current_post["comments"] = current->comments;
                current_post["shares"] = current->shares;

                response[response.size()] = move(current_post);
                current = current->next;
            }

            return crow::response(200, response);
        } catch (const exception& e) {
            return crow::response(500, string("Server error: ") + e.what());
        }
    }

    crow::response likePost(const crow::request& req) {
        try {
            auto json = crow::json::load(req.body);
            if (!json) {
                return crow::response(400, "Invalid JSON");
            }

            string post_id = getStringOrDefault(json, "postId");
            string user_id = getStringOrDefault(json, "userId");
            string timestamp = getStringOrDefault(json, "likedAt");

            Like* new_like = new Like();
            new_like->postId = post_id;
            new_like->userId = user_id;
            new_like->likedAt = timestamp;
            new_like->next = likes_head;
            likes_head = new_like;

            Post* current = posts_head;
            while (current) {
                if (current->uniqueId == post_id) {
                    current->likes += 1;
                    crow::json::wvalue response;
                    response["postId"] = post_id;
                    response["status"] = "success";
                    return crow::response(200, response);
                }
                current = current->next;
            }
            return crow::response(404, "Post not found");
        } catch (const exception& e) {
            return crow::response(500, string("Server error: ") + e.what());
        }
    }

    crow::response unlikePost(const crow::request& req) {
        try {
            auto json = crow::json::load(req.body);
            if (!json) {
                return crow::response(400, "Invalid JSON");
            }

            string post_id = getStringOrDefault(json, "postId");
            string user_id = getStringOrDefault(json, "userId");

            Like* current = likes_head;
            Like* prev = nullptr;
            bool like_found = false;

            while (current) {
                if (current->postId == post_id && current->userId == user_id) {
                    if (prev) prev->next = current->next;
                    else likes_head = current->next;
                    delete current;
                    like_found = true;
                    break;
                }
                prev = current;
                current = current->next;
            }

            if (!like_found) {
                return crow::response(404, "Like not found");
            }

            Post* post_current = posts_head;
            while (post_current) {
                if (post_current->uniqueId == post_id) {
                    post_current->likes = max(0, post_current->likes - 1);
                    crow::json::wvalue response;
                    response["postId"] = post_id;
                    response["status"] = "success";
                    return crow::response(200, response);
                }
                post_current = post_current->next;
            }
            return crow::response(404, "Post not found");
        } catch (const exception& e) {
            return crow::response(500, string("Server error: ") + e.what());
        }
    }

    crow::response comment(const crow::request& req) {
        try {
            auto json = crow::json::load(req.body);
            if (!json) {
                return crow::response(400, "Invalid JSON");
            }

            string post_id = getStringOrDefault(json, "postId");
            string user_id = getStringOrDefault(json, "userId");
            string comment_text = getStringOrDefault(json, "comment");
            string commentAt = getStringOrDefault(json, "commentAt");

            Comment* new_comment = new Comment();
            new_comment->postId = post_id;
            new_comment->userId = user_id;
            new_comment->comment = comment_text;
            new_comment->commentAt = commentAt;
            new_comment->next = comments_head;
            comments_head = new_comment;

            Post* current = posts_head;
            while (current) {
                if (current->uniqueId == post_id) {
                    current->comments += 1;
                    crow::json::wvalue response;
                    response["postId"] = post_id;
                    response["status"] = "success";
                    return crow::response(200, response);
                }
                current = current->next;
            }
            return crow::response(404, "Post not found");
        } catch (const exception& e) {
            return crow::response(500, string("Server error: ") + e.what());
        }
    }

    crow::response getAllComments() {
        try {
            crow::json::wvalue response(crow::json::type::List);
            Comment* current = comments_head;

            while (current) {
                crow::json::wvalue current_comment(crow::json::type::Object);
                current_comment["postId"] = current->postId;
                current_comment["user_id"] = current->userId;
                current_comment["comment"] = current->comment;
                current_comment["commentAt"] = current->commentAt;

                response[response.size()] = move(current_comment);
                current = current->next;
            }

            return crow::response(200, response);
        } catch (const exception& e) {
            return crow::response(500, string("Server error: ") + e.what());
        }
    }

    crow::response share(const crow::request& req) {
        try {
            auto json = crow::json::load(req.body);
            if (!json) {
                return crow::response(400, "Invalid JSON");
            }

            string post_id = getStringOrDefault(json, "postId");
            string user_id = getStringOrDefault(json, "userId");

            Post* current = posts_head;
            while (current) {
                if (current->uniqueId == post_id) {
                    current->shares += 1;
                    crow::json::wvalue response;
                    response["postId"] = post_id;
                    response["status"] = "success";
                    return crow::response(200, response);
                }
                current = current->next;
            }
            return crow::response(404, "Post not found");
        } catch (const exception& e) {
            return crow::response(500, string("Server error: ") + e.what());
        }
    }

   crow::response getTopTrendingPosts(int limit) {
    try {
        // First, collect all posts and their scores in a vector for sorting
        vector<pair<Post*, double>> posts_with_scores;
        Post* current = posts_head;
        
        while (current) {
            double score = calculateTrendingScore(
                current->likes,
                current->comments,
                current->shares
            );
            posts_with_scores.push_back({current, score});
            current = current->next;
        }

        // Sort posts by trending score
        sort(posts_with_scores.begin(), posts_with_scores.end(),
            [](const auto& a, const auto& b) {
                return a.second > b.second; // Sort in descending order
            });

        // Create JSON response with limited posts
        crow::json::wvalue response(crow::json::type::List);
        
        int actualLimit = min(limit, static_cast<int>(posts_with_scores.size()));
        
        for (int i = 0; i < actualLimit; i++) {
            crow::json::wvalue post;
            Post* current_post = posts_with_scores[i].first;
            
            post["uniqueId"] = current_post->uniqueId;
            post["user_id"] = current_post->user_id;
            post["post_type"] = current_post->post_type;
            post["content"] = current_post->content;
            post["media_type"] = current_post->media_type;
            post["media_urls"] = current_post->media_urls;
            post["timestamp"] = current_post->timestamp;
            post["location"] = current_post->location;
            post["likes"] = current_post->likes;
            post["comments"] = current_post->comments;
            post["shares"] = current_post->shares;
            post["trending_score"] = posts_with_scores[i].second;
            
            response[i] = std::move(post);
        }
        
        return crow::response(200, response);
    } catch (const exception& e) {
        return crow::response(500, string("Server error: ") + e.what());
    }
}
};

class TrieNode {
public:
    unordered_map<char, TrieNode*> children;
    bool isEndOfWord;
    string originalWord;  

    TrieNode() : isEndOfWord(false) {}
};

class Trie {
private:
    TrieNode* root;
    unordered_map<string, string>& emailMap;  

    void collectAllWords(TrieNode* node,string prefix,vector<string>& results) {
        if (node->isEndOfWord) {
            results.push_back(node->originalWord);  
        }
        for (auto& pair : node->children) {
            collectAllWords(pair.second, prefix + pair.first, results);
        }
    }

public:
    Trie(unordered_map<string,string>& userEmailMap) 
        : emailMap(userEmailMap) {
        root = new TrieNode();
    }

    void insert(const string& word) {
        TrieNode* current = root;
        string lowerWord = word;
        for (char& c : lowerWord) {
            c = std::tolower(c);
        }

        for (char ch : lowerWord) {
            if (current->children.find(ch) == current->children.end()) {
                current->children[ch] = new TrieNode();
            }
            current = current->children[ch];
        }
        current->isEndOfWord = true;
        current->originalWord = word;  

        CROW_LOG_DEBUG << "Inserted word: " << word << " with email: " << emailMap[word];
    }

    vector<string> search(const string& prefix) {
        TrieNode* current = root;
        string lowerPrefix = prefix;
        for (char& c : lowerPrefix) {
            c = tolower(c);
        }

        CROW_LOG_DEBUG << "Searching for prefix: " << lowerPrefix;

        for (char ch : lowerPrefix) {
            if (current->children.find(ch) == current->children.end()) {
                CROW_LOG_DEBUG << "Prefix not found in trie at character: " << ch;
                return {};
            }
            current = current->children[ch];
        }

        vector<string> results;
        collectAllWords(current, lowerPrefix, results);

        for (const auto& username : results) {
            CROW_LOG_DEBUG << "Found username: " << username << " with email: " << emailMap[username];
        }

        return results;
    }

    void printAllWords() {
        vector<std::string> allWords;
        collectAllWords(root, "", allWords);
        CROW_LOG_DEBUG << "Total words in trie: " << allWords.size();
        for (const auto& word : allWords) {
            CROW_LOG_DEBUG << "Word in trie: " << word << " with email: " << emailMap[word];
        }
    }
};


struct Userstructure {
    string username;
    int age;
    string email;
    string password;
    string recoveryKey;
};

struct FriendNode {
    string senderEmail;
    string receiverEmail;
    string timestamp;
    string status;
    FriendNode* next;
    
    FriendNode() {
        status = "NotAccepted";
        next = NULL;
    }
};

class UserArray {
private:
    Userstructure* arr;
    int capacity;
    int currentSize;

    void resize() {
        capacity *= 2;
        Userstructure* temp = new Userstructure[capacity];
        for(int i = 0; i < currentSize; i++) {
            temp[i] = arr[i];
        }
        delete[] arr;
        arr = temp;
    }

public:
    UserArray() {
        capacity = 10;
        currentSize = 0;
        arr = new Userstructure[capacity];
    }

    void push(Userstructure user) {
        if(currentSize == capacity) {
            resize();
        }
        arr[currentSize++] = user;
    }

    int size() { return currentSize; }

    Userstructure& operator[](int index) {
        return arr[index];
    }

    ~UserArray() {
        delete[] arr;
    }
};

class FriendSystem {
private:
    FriendNode* head;  
    UserArray users;
    int stackSize;
    const string USERS_FILENAME = "D:\\C++\\DSA\\SocialApp\\backend\\data\\users.txt";
    const string REQUESTS_FILENAME = "D:\\C++\\DSA\\SocialApp\\backend\\data\\friendrequest.txt";

    void loadUsers() {
        ifstream file(USERS_FILENAME);
        if (!file.is_open()) {
            cout << "Error: Unable to open users file!" << endl;
            return;
        }

        string line;
        while (getline(file, line)) {
            Userstructure user;
            user.username = line;
            
            getline(file, line);
            user.age = stoi(line);
            
            getline(file, line);
            user.email = line;
            
            getline(file, line);
            user.password = line;
            
            getline(file, line);
            user.recoveryKey = line;
            
            users.push(user);
        }
        file.close();
    }

    void loadRequests() {
        ifstream file(REQUESTS_FILENAME);
        if (!file.is_open()) {
            cout << "No existing friend requests found. Starting fresh." << endl;
            return;
        }

        string line;
        while (getline(file, line)) {
            FriendNode* newRequest = new FriendNode();
            newRequest->senderEmail = line;
            getline(file, newRequest->receiverEmail);
            getline(file, newRequest->timestamp);
            getline(file, newRequest->status);
            
            newRequest->next = head;
            head = newRequest;
            stackSize++;
        }
        file.close();
    }

    void saveRequests() {
        ofstream file(REQUESTS_FILENAME);
        if (!file.is_open()) {
            cout << "Error: Unable to save friend requests!" << endl;
            return;
        }

        FriendNode* current = head;
        while (current != NULL) {
            file << current->senderEmail << endl;
            file << current->receiverEmail << endl;
            file << current->timestamp << endl;
            file << current->status << endl;
            current = current->next;
        }
        file.close();
    }

    Userstructure* findUserByEmail(const string& email) {
        for (int i = 0; i < users.size(); i++) {
            if (users[i].email == email) {
                return &users[i];
            }
        }
        return nullptr;
    }

    bool hasExistingRequest(const string& senderEmail, const string& receiverEmail) {
        FriendNode* current = head;
        while (current != NULL) {
            if (current->senderEmail == senderEmail && 
                current->receiverEmail == receiverEmail) {
                return true;
            }
            current = current->next;
        }
        return false;
    }

    crow::json::wvalue userToJson(const Userstructure& user) {
        crow::json::wvalue userData;
        userData["username"] = user.username;
        userData["age"] = user.age;
        userData["email"] = user.email;
        return userData;
    }

public:
    FriendSystem() {
        head = NULL;
        stackSize = 0;
        loadUsers();
        loadRequests();
    }

    crow::json::wvalue getAvailableUsers(const string& currentUserEmail) {
        vector<crow::json::wvalue> availableUsers;
        
        Userstructure* currentUser = findUserByEmail(currentUserEmail);
        if (!currentUser) {
            crow::json::wvalue response;
            response["users"] = std::move(availableUsers);
            return response;
        }

        for (int i = 0; i < users.size(); i++) {
            if (users[i].email != currentUserEmail && 
                !hasExistingRequest(currentUserEmail, users[i].email)) {
                availableUsers.push_back(userToJson(users[i]));
            }
        }

        crow::json::wvalue response;
        response["users"] = std::move(availableUsers);
        return response;
    }

    bool pushRequest(const string& senderEmail, const string& receiverEmail, const string& timestamp) {
        if (!findUserByEmail(senderEmail) || !findUserByEmail(receiverEmail)) {
            return false;
        }

        if (hasExistingRequest(senderEmail, receiverEmail)) {
            return false;
        }

        FriendNode* newRequest = new FriendNode();
        newRequest->senderEmail = senderEmail;
        newRequest->receiverEmail = receiverEmail;
        newRequest->timestamp = timestamp;
        
        newRequest->next = head;
        head = newRequest;
        stackSize++;
        
        saveRequests();
        return true;
    }

    bool acceptRequest(const string& senderEmail, const string& receiverEmail, 
                      const string& timestamp) {
        FriendNode* current = head;
        while (current != NULL) {
            if (current->senderEmail == senderEmail && 
                current->receiverEmail == receiverEmail && 
                current->timestamp == timestamp) {
                current->status = "Accepted";
                saveRequests();
                return true;
            }
            current = current->next;
        }
        return false;
    }

    crow::json::wvalue getAllRequests() {
        vector<crow::json::wvalue> requests;
        FriendNode* current = head;
        
        while (current != NULL) {
            Userstructure* sender = findUserByEmail(current->senderEmail);
            Userstructure* receiver = findUserByEmail(current->receiverEmail);
            
            if (sender && receiver) {
                crow::json::wvalue request;
                request["sender"] = userToJson(*sender);
                request["receiver"] = userToJson(*receiver);
                request["timestamp"] = current->timestamp;
                request["status"] = current->status;
                requests.push_back(std::move(request));
            }
            current = current->next;
        }
        
        crow::json::wvalue response;
        response["requests"] = std::move(requests);
        return response;
    }

    crow::json::wvalue getReceivedRequests(const string& userEmail) {
        vector<crow::json::wvalue> receivedRequests;
        FriendNode* current = head;
        
        while (current != NULL) {
            if (current->receiverEmail == userEmail && 
                current->status == "NotAccepted") {
                Userstructure* sender = findUserByEmail(current->senderEmail);
                if (sender) {
                    crow::json::wvalue request;
                    request["sender"] = userToJson(*sender);
                    request["timestamp"] = current->timestamp;
                    request["status"] = current->status;
                    receivedRequests.push_back(std::move(request));
                }
            }
            current = current->next;
        }
        
        crow::json::wvalue response;
        response["requests"] = std::move(receivedRequests);
        return response;
    }
    crow::json::wvalue getFriends(const string& userEmail) {
    vector<crow::json::wvalue> friends;
    FriendNode* current = head;

    while (current != NULL) {
        if ((current->senderEmail == userEmail || current->receiverEmail == userEmail) && 
            current->status == "Accepted") {
            Userstructure* friendUser = findUserByEmail(current->senderEmail == userEmail ? current->receiverEmail : current->senderEmail);
            if (friendUser) {
                friends.push_back(userToJson(*friendUser));
            }
        }
        current = current->next;
    }

    crow::json::wvalue response;
    response["friends"] = std::move(friends);
    return response;
}

    ~FriendSystem() {
        while (head != NULL) {
            FriendNode* temp = head;
            head = head->next;
            delete temp;
        }
    }
};



int main() {
    crow::App<crow::CORSHandler> app;
    PostHandler post_handler;
    User user_handler;

auto& cors = app.get_middleware<crow::CORSHandler>();
cors
    .global()
    .methods("POST"_method, "GET"_method)
    .prefix("/api")
    .origin("http://localhost:5173")
    .allow_credentials()
    .headers("Content-Type", "Accept", "Authorization")
    .max_age(86400);

CROW_ROUTE(app, "/api/register")
.methods("POST"_method)
([&user_handler](const crow::request& req) {
    try {
        auto json = crow::json::load(req.body);
        if (!json) {
            return crow::response(400, R"({"status": "Failure", "message": "Invalid JSON"})");
        }
        string file = "data/users.txt";
        string name = json["name"].s();
        int age = json["age"].i();
        string email = json["email"].s();
        string password = json["password"].s();
        int recoveryKey = json["recoveryKey"].i();

        user_handler.registration(file, name, age, email, password, recoveryKey);

        crow::json::wvalue response;
        response["status"] = "Success";
        response["message"] = "Registration successful.";
        return crow::response(200, response);
    } catch (const exception& e) {
        crow::json::wvalue error_response;
        error_response["status"] = "Failure";
        error_response["message"] = string("Server error: ") + e.what();
        return crow::response(500, error_response);
    }
});

CROW_ROUTE(app, "/api/login")
.methods("POST"_method)
([&user_handler](const crow::request& req) {
    try {
        auto json = crow::json::load(req.body);
        CROW_LOG_INFO << "Received request: " << req.body;

        if (!json) {
            CROW_LOG_ERROR << "Invalid JSON";
            return crow::response(400, R"({"status": "Failure", "message": "Invalid JSON"})");
        }
        string email = json["email"].s();
        string password = json["password"].s();

        if (user_handler.login("data/users.txt", email, password)) {
            return crow::response(200, R"({"status": "Success", "message": "Login successful."})");
        } else {
            CROW_LOG_ERROR << "Invalid credentials for email: " << email;
            return crow::response(401, R"({"status": "Failure", "message": "Invalid email or password."})");
        }
    } catch (const std::exception& e) {
        CROW_LOG_ERROR << "Error: " << e.what();
        return crow::response(500, R"({"status": "Failure", "message": "Server error"})");
    }
});



CROW_ROUTE(app, "/api/forgotpassword")
.methods("POST"_method)
([&user_handler](const crow::request& req) {
    try {
                CROW_LOG_ERROR << "Yaha tak agay hu bhai";
        auto json = crow::json::load(req.body);
               CROW_LOG_ERROR << json; 
        if (!json) {
            return crow::response(400, R"({"status": "Failure", "message": "Invalid JSON"})");
        }
        string file = "data/users.txt";
        string tempfile = "data/temp.txt";
        string email = json["email"].s();
        int recoveryKey = json["recoveryKey"].i();
        string newPassword = json["newPassword"].s();

        if (user_handler.forgotpassword(file, tempfile, email, recoveryKey, newPassword)) {
            crow::json::wvalue response;
            response["status"] = "Success";
            response["message"] = "Password reset successful.";
            return crow::response(200, response);
        } else {
            crow::json::wvalue error_response;
            error_response["status"] = "Failure";
            error_response["message"] = "Invalid email or recovery key.";
            return crow::response(401, error_response);
        }
    } catch (const exception& e) {
        crow::json::wvalue error_response;
        error_response["status"] = "Failure";
        error_response["message"] = string("Server error: ") + e.what();
        return crow::response(500, error_response);
    }
});
    CROW_ROUTE(app, "/api/user/<string>")
        .methods("GET"_method)
    ([&user_handler](string email) {
        CROW_LOG_ERROR<<"YAHA TAK TO AGYA HU BHAI!!";
        return user_handler.findUserByEmail(email);
    });


    CROW_ROUTE(app, "/api/posts")
        .methods("POST"_method)
    ([&post_handler](const crow::request& req) {
        return post_handler.createPost(req);
    });

    CROW_ROUTE(app, "/api/allposts")
        .methods("GET"_method)
    ([&post_handler]() {
        return post_handler.getAllPosts();
    });

    CROW_ROUTE(app, "/api/like")
        .methods("POST"_method)
    ([&post_handler](const crow::request& req) {
        return post_handler.likePost(req);
    });

    CROW_ROUTE(app, "/api/unlike")
        .methods("POST"_method)
    ([&post_handler](const crow::request& req) {
        return post_handler.unlikePost(req);
    });

    CROW_ROUTE(app, "/api/comment")
        .methods("POST"_method)
    ([&post_handler](const crow::request& req) {
        return post_handler.comment(req);
    });

    CROW_ROUTE(app, "/api/allcomments")
        .methods("GET"_method)
    ([&post_handler](const crow::request& req) {
        return post_handler.getAllComments();
    });

    CROW_ROUTE(app, "/api/share")
        .methods("POST"_method)
    ([&post_handler](const crow::request& req) {
        return post_handler.share(req);
    });

    CROW_ROUTE(app, "/api/posts/trending/<int>")
        .methods("GET"_method)
    ([&post_handler](int limit) {
        return post_handler.getTopTrendingPosts(limit);
    });
    
    unordered_map<string, string> userEmailMap;
       Trie trie(userEmailMap);  /

    ifstream file("data/users.txt");
    if (!file.is_open()) {
        CROW_LOG_ERROR << "Failed to open users.txt file";
        return 1;
    }

    string line;
    int userCount = 0;
    while (std::getline(file, line)) {
        string username = line;
        getline(file, line);
        getline(file, line);
        string email = line;
        getline(file, line); 
        getline(file, line); 

        userEmailMap[username] = email;
        trie.insert(username);
        
        userCount++;
        CROW_LOG_DEBUG << "Added user: " << username << " with email: " << email;
    }
    file.close();

    CROW_LOG_INFO << "Loaded " << userCount << " users into the trie";
    trie.printAllWords();

    CROW_ROUTE(app, "/api/searchuser/<string>")
    ([&trie, &userEmailMap](const std::string& prefix) {
        CROW_LOG_DEBUG << "Received search request for prefix: " << prefix;

        crow::json::wvalue response;
        vector<string> recommendations = trie.search(prefix);
        
        CROW_LOG_DEBUG << "Found " << recommendations.size() << " recommendations";

        std::vector<crow::json::wvalue> results;
        for (const string& username : recommendations) {
            crow::json::wvalue user;
            user["username"] = username;
            
            auto emailIt = userEmailMap.find(username);
            if (emailIt != userEmailMap.end()) {
                user["email"] = emailIt->second;
                CROW_LOG_DEBUG << "Found email for " << username << ": " << emailIt->second;
            } else {
                CROW_LOG_DEBUG << "No email found for username: " << username;
                user["email"] = "";
            }
            
            results.push_back(std::move(user));
        }

        response["recommendations"] = std::move(results);
        return response;
    });


    FriendSystem friendSystem;

    CROW_ROUTE(app, "/api/friends/requests")
    ([&friendSystem]() {
        return friendSystem.getAllRequests();
    });

    CROW_ROUTE(app, "/api/friends/available/<string>")
    ([&friendSystem](const string& currentUserEmail) {
        return friendSystem.getAvailableUsers(currentUserEmail);
    });

    CROW_ROUTE(app, "/api/friends/request").methods("POST"_method)
    ([&friendSystem](const crow::request& req) {
        auto x = crow::json::load(req.body);
        if (!x)
            return crow::response(400, "Invalid JSON");

        if (!x.has("senderEmail") || !x.has("receiverEmail") || !x.has("timestamp"))
            return crow::response(400, "Missing required fields");

        bool success = friendSystem.pushRequest(
            x["senderEmail"].s(),
            x["receiverEmail"].s(),
            x["timestamp"].s()
        );

        if (success) {
            crow::json::wvalue response;
            response["message"] = "Friend request created";
            return crow::response(201, response);
        } else {
            return crow::response(400, "Invalid request or duplicate request");
        }
    });

    CROW_ROUTE(app, "/api/friends/request/accept").methods("POST"_method)
    ([&friendSystem](const crow::request& req) {
        auto x = crow::json::load(req.body);
        if (!x)
            return crow::response(400, "Invalid JSON");

        if (!x.has("senderEmail") || !x.has("receiverEmail") || !x.has("timestamp"))
            return crow::response(400, "Missing required fields");

        bool success = friendSystem.acceptRequest(
            x["senderEmail"].s(),
            x["receiverEmail"].s(),
            x["timestamp"].s()
        );

        if (success) {
            crow::json::wvalue response;
            response["message"] = "Friend request accepted";
            return crow::response(200, response);
        } else {
            return crow::response(404, "Friend request not found");
        }
    });

    CROW_ROUTE(app, "/api/friends/requests/received/<string>")
    ([&friendSystem](const string& userEmail) {
        return friendSystem.getReceivedRequests(userEmail);
    });

        CROW_ROUTE(app, "/getFriends/<string>")
    ([&friendSystem](const crow::request& req, crow::response& res, const string& userEmail) {
        auto friends = friendSystem.getFriends(userEmail);
        res.write(friends.dump());
        res.end();
    });

    app.port(3000)
        .multithreaded()
        .run();

    return 0;
}