#include <random>
#include <string>
#include <utility>
#include <iostream>

using namespace std;

struct Person
{
    auto move() -> std::pair<int, int>;

    auto try_to_infect(Person &person) -> void;

    auto get_status() -> std::string;

    // this order is bad - fix it!
    std::mt19937 eng{std::random_device{}()};          // largest (~5000 bytes)
    std::uniform_int_distribution<> move_dis{0, 7};    
    std::uniform_real_distribution<> infect_dis{0, 1}; 
    int id{-1};                                        
    int position_x{0};                                 
    int position_y{0};                                 
    // Group bools together to potentially share a word
    bool infected{false};                              
    bool immune{false}; 
};

auto main() -> int   {
    cout <<sizeof(Person) << endl ;
}